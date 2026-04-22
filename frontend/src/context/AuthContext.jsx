import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Normaliza el objeto de usuario para que siempre tenga `role` y `name`
// independientemente de si viene del JWT o de la BD
const normalizeUser = (raw) => {
  if (!raw) return null;
  return {
    ...raw,
    role: raw.role ?? raw.IDRol ?? null,          // JWT usa `role`, BD usa `IDRol`
    name: raw.name ?? raw.NombreUsuario ?? '',     // JWT usa `name`, BD usa `NombreUsuario`
    permissions: raw.permissions ?? [],
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hotelsys_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          localStorage.setItem('hotelsys_token', token);
          const response = await fetch('http://localhost:3000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok && data.user) {
            setUser(normalizeUser(data.user));
          } else {
            logout();
          }
        } catch (error) {
          console.error('Error validando sesión:', error);
          logout();
        }
      } else {
        setUser(null);
        localStorage.removeItem('hotelsys_token');
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    setToken(data.token);
    setUser(normalizeUser(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hotelsys_token');
  };

  const register = async (userData) => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar');
    }
    return data;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
