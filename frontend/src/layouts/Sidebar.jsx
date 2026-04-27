import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BedDouble, CalendarCheck, Users, Coffee, PackageOpen, Settings, Menu, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/' },
    { icon: <BedDouble size={20} />, label: 'Habitaciones', path: '/habitaciones' },
    { icon: <CalendarCheck size={20} />, label: 'Reservas', path: '/reservas' },
    { icon: <Users size={20} />, label: 'Clientes', path: '/clientes' },
    { icon: <Coffee size={20} />, label: 'Servicios', path: '/servicios' },
    { icon: <PackageOpen size={20} />, label: 'Paquetes', path: '/paquetes' },
    { icon: <ShieldCheck size={20} />, label: 'Roles y Permisos', path: '/roles-permisos' },
    { icon: <Settings size={20} />, label: 'Configuración', path: '/configuracion' },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!user || (!user.permissions && user.role !== 1)) return false;
    if (user.role === 1 || user.permissions?.includes('ALL')) return true;
    if (item.path === '/') return true; // Siempre mostrar dashboard a conectados
    return user.permissions?.includes(item.path);
  });

  return (
    <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="logo-icon glass-panel">H</div>
          <h2 className="logo-text">HotelABC</h2>
        </div>
        <button type="button" className="menu-toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          <Menu size={22} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredNavItems.map((item, index) => {
          const targetPath = `/admin${item.path === '/' ? '' : item.path}`;
          return (
          <NavLink
            key={item.path}
            to={targetPath}
            className={({ isActive }) => `nav-item animate-fade-in animate-delay-${(index + 1) * 100} ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile glass-panel" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="avatar" title={user?.name}>
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="user-info" style={{ flexGrow: 1 }}>
            <p className="user-name">{user?.name || 'Admin'}</p>
            <p className="user-role">
               {user?.role === 1 ? 'Administrador' : 'Personal Hotel'}
            </p>
          </div>
          {!isCollapsed && (
            <button 
              onClick={logout} 
              style={{ background: 'transparent', color: '#fca5a5', border: 'none', cursor: 'pointer', padding: '4px', transition: 'color 0.2s' }} 
              title="Cerrar Sesión"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#fca5a5'}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
