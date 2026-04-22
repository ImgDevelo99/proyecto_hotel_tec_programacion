import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Save, AlertCircle } from 'lucide-react';
import Button from '../../components/Button/Button';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de seguridad inválido o ausente. Solicita uno nuevo.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      setSuccess('¡Contraseña actualizada con éxito!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Nueva Contraseña</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>Ingresa una nueva contraseña segura para tu cuenta.</p>
      </div>

      {error && (
        <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', borderRadius: '12px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}
      
      {success ? (
        <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', textAlign: 'center', color: '#6ee7b7', borderRadius: '12px', fontSize: '0.95rem' }}>
          {success}<br/>Redirigiendo...
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Contraseña Nueva</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength="6"
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '12px 12px 12px 40px', borderRadius: '12px', outline: 'none', transition: 'var(--transition-normal)' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Confirmar Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength="6"
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '12px 12px 12px 40px', borderRadius: '12px', outline: 'none', transition: 'var(--transition-normal)' }}
              />
            </div>
          </div>

          <Button type="submit" style={{ width: '100%', padding: '14px', marginTop: '8px', display: 'flex', justifyContent: 'center' }} disabled={loading || !token}>
            {loading ? 'Guardando...' : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Guardar Cambios <Save size={18} /></span>}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
