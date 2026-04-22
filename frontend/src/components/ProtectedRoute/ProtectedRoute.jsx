import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--color-bg-base)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Clientes con IDRol 2 van al Portal de Cliente, no al Admin Dashboard
  if (isAuthenticated && user?.role === 2) {
    // Si no están en /mi-portal, llevarlos allá
    if (!location.pathname.startsWith('/mi-portal')) {
      return <Navigate to="/mi-portal" replace />;
    }
    return <Outlet />;
  }

  // RBAC Access Control para otros roles
  if (user?.role !== 1 && user?.permissions && !user.permissions.includes('ALL')) {
    const isAllowed = user.permissions.includes(location.pathname) || location.pathname === '/';
    if (!isAllowed) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
