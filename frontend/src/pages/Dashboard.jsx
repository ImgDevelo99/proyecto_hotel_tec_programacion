import React, { useEffect, useState } from 'react';
import { Users, BedDouble, CalendarCheck, TrendingUp } from 'lucide-react';
import Card from '../components/Card/Card';
import { api } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    habitaciones: 0,
    reservas: 0,
    clientes: 0,
    ingresos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [habData, resData, cliData] = await Promise.all([
          api.get('/habitaciones'),
          api.get('/reservas'),
          api.get('/clientes')
        ]);
        
        const totalIngresos = resData.reduce((sum, res) => sum + (res.MontoTotal || 0), 0);
        
        setStats({
          habitaciones: habData.length,
          reservas: resData.length,
          clientes: cliData.length,
          ingresos: totalIngresos
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Habitaciones Totales', value: stats.habitaciones, icon: <BedDouble size={24} color="var(--color-primary)" />, trend: '+2%' },
    { title: 'Reservas Activas', value: stats.reservas, icon: <CalendarCheck size={24} color="var(--color-secondary)" />, trend: '+15%' },
    { title: 'Clientes Registrados', value: stats.clientes, icon: <Users size={24} color="var(--color-accent)" />, trend: '+8%' },
    { title: 'Ingresos Estimados', value: `$${stats.ingresos.toLocaleString()}`, icon: <TrendingUp size={24} color="var(--color-warning)" />, trend: '+12%' },
  ];

  return (
    <div className="dashboard-page">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {statCards.map((stat, i) => (
          <Card key={i} className={`animate-slide-up animate-delay-${(i+1)*100}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{stat.title}</p>
                {loading ? (
                  <div style={{ height: '32px', width: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', animation: 'pulseGlow 1.5s infinite' }}></div>
                ) : (
                  <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>{stat.value}</h2>
                )}
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                {stat.icon}
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>{stat.trend}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>vs mes anterior</span>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <Card title="Resumen de Reservas Recientes" className="animate-slide-up animate-delay-300">
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            Gráfico de Actividad (Próximamente)
          </div>
        </Card>
        
        <Card title="Acciones Rápidas" className="animate-slide-up animate-delay-400">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', color: 'white', textAlign: 'left', transition: 'var(--transition-normal)' }}>
              + Nueva Reserva
            </button>
            <button className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', color: 'white', textAlign: 'left', transition: 'var(--transition-normal)' }}>
              + Registrar Cliente
            </button>
            <button className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', color: 'white', textAlign: 'left', transition: 'var(--transition-normal)' }}>
              📝 Generar Reporte
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
