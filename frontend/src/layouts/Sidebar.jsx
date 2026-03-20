import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BedDouble, CalendarCheck, Users, Coffee, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/' },
    { icon: <BedDouble size={20} />, label: 'Habitaciones', path: '/habitaciones' },
    { icon: <CalendarCheck size={20} />, label: 'Reservas', path: '/reservas' },
    { icon: <Users size={20} />, label: 'Clientes', path: '/clientes' },
    { icon: <Coffee size={20} />, label: 'Servicios', path: '/servicios' },
    { icon: <Settings size={20} />, label: 'Configuración', path: '/configuracion' },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-icon glass-panel">H</div>
        <h2 className="logo-text">HotelSys</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item animate-fade-in animate-delay-${(index + 1) * 100} ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile glass-panel">
          <div className="avatar">AD</div>
          <div className="user-info">
            <p className="user-name">Admin</p>
            <p className="user-role">Superuser</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
