import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';
import Button from '../../components/Button/Button';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await register(formData);
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo al Login...');
      setTimeout(() => navigate('/login'), 2000);
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
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Crear Cuenta</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Únete y gestiona el hotel de forma moderna</p>
      </div>

      {error && (
        <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', borderRadius: '12px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}
      
      {success && (
        <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', textAlign: 'center', color: '#6ee7b7', borderRadius: '12px', fontSize: '0.9rem' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Nombre</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. Ana" required
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '12px 12px 12px 40px', borderRadius: '12px', outline: 'none', transition: 'var(--transition-normal)' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Apellido</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Ej. Gómez" required
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '12px 12px 12px 40px', borderRadius: '12px', outline: 'none', transition: 'var(--transition-normal)' }}
              />
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Correo Electrónico</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@correo.com" required
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '12px 12px 12px 40px', borderRadius: '12px', outline: 'none', transition: 'var(--transition-normal)' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Contraseña Segura</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required minLength="6"
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '12px 12px 12px 40px', borderRadius: '12px', outline: 'none', transition: 'var(--transition-normal)' }}
            />
          </div>
        </div>

        <Button type="submit" style={{ width: '100%', padding: '14px', marginTop: '8px', display: 'flex', justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Creando...' : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserPlus size={18} /> Registrarse</span>}
        </Button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
        ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>Inicia sesión</Link>
      </div>
    </div>
  );
};

export default Register;
