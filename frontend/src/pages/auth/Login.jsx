import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import Button from '../../components/Button/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await login(formData.email, formData.password);
      // Redirigir según el rol: Clientes van a su portal, admins/personal al dashboard
      const role = data?.user?.role ?? data?.user?.IDRol;
      navigate(role === 2 ? '/mi-portal' : '/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ width: '56px', height: '56px', background: 'var(--color-primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>H</span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Bienvenido de Vuelta</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Ingresa a HotelSys</p>
      </div>

      {error && (
        <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', borderRadius: '12px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Correo Electrónico</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              required
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '12px 12px 12px 40px', borderRadius: '12px', outline: 'none', transition: 'var(--transition-normal)' }}
            />
          </div>
        </div>

        <div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Contraseña</label>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }}>¿Olvidaste tu clave?</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '12px 12px 12px 40px', borderRadius: '12px', outline: 'none', transition: 'var(--transition-normal)' }}
            />
          </div>
        </div>

        <Button type="submit" style={{ width: '100%', padding: '14px', marginTop: '8px', display: 'flex', justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Verificando...' : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LogIn size={18} /> Iniciar Sesión</span>}
        </Button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
        ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>Regístrate aquí</Link>
      </div>
    </div>
  );
};

export default Login;
