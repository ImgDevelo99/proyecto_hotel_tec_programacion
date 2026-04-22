import React, { useEffect, useState } from 'react';
import { Users, BedDouble, CalendarCheck, TrendingUp, Package, PieChart as PieChartIcon } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import Card from '../components/Card/Card';
import { api } from '../services/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    habitaciones: 0,
    reservas: 0,
    clientes: 0,
    ingresos: 0
  });
  const [chartData, setChartData] = useState({
    revenue: [],
    statuses: [],
    packages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [habData, resData, cliData, analyticsData] = await Promise.all([
          api.get('/habitaciones'),
          api.get('/reservas'),
          api.get('/clientes'),
          api.get('/analytics/dashboard')
        ]);
        
        const totalIngresos = resData.length > 0 ? resData.reduce((sum, res) => sum + (parseFloat(res.MontoTotal) || 0), 0) : 0;
        
        setStats({
          habitaciones: habData?.length || 0,
          reservas: resData?.length || 0,
          clientes: cliData?.length || 0,
          ingresos: totalIngresos
        });

        setChartData({
          revenue: analyticsData?.revenue || [],
          statuses: analyticsData?.statuses || [],
          packages: analyticsData?.packages || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <Card title="Evolución de Ingresos y Reservas" className="animate-slide-up animate-delay-400">
          <div style={{ height: '350px', width: '100%', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.revenue}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="ingresos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" dataKey="reservas" stroke="#8b5cf6" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Distribución por Estado de Reserva" className="animate-slide-up animate-delay-500">
          <div style={{ height: '350px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={chartData.statuses}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.statuses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <Card title="Ranking de Paquetes Más Vendidos" className="animate-slide-up animate-delay-600">
          <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.packages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#f1f5f9', fontSize: 12}} width={120} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={25}>
                  {chartData.packages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Actividad del Sistema" className="animate-slide-up animate-delay-700">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <TrendingUp size={24} color="#3b82f6" />
              <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>Sincronización Activa</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Métricas actualizadas desde la BD</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(236, 72, 153, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
               <Package size={24} color="#ec4899" />
               <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>Control de Paquetes</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Análisis de demanda en tiempo real</p>
              </div>
            </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(139, 92, 246, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
               <PieChartIcon size={24} color="#8b5cf6" />
               <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>Gestión de Estados</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Monitoreo de flujo de reservación</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
