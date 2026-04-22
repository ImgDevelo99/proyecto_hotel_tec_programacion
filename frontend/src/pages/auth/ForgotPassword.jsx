import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '../../components/Button/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setSuccess('Si el correo existe en nuestro sistema, hemos enviado las instrucciones para recuperar tu contraseña.');
    } catch (err) {
      setError(err.message || 'Error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Recuperar Clave</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>Ingresa tu correo para recibir un enlace de recuperación seguro.</p>
      </div>

      {error && (
        <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', borderRadius: '12px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}
      
      {success ? (
        <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', textAlign: 'center', color: '#6ee7b7', borderRadius: '12px', fontSize: '0.95rem' }}>
          {success}
          <div style={{ marginTop: '24px' }}>
            <Link to="/login">
              <Button type="button" variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>Volver al Login</Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '12px 12px 12px 40px', borderRadius: '12px', outline: 'none', transition: 'var(--transition-normal)' }}
              />
            </div>
          </div>

          <Button type="submit" style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Enviando...' : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Enviar Enlace <ArrowRight size={18} /></span>}
          </Button>
        </form>
      )}

      {!success && (
        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>Regresar</Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
