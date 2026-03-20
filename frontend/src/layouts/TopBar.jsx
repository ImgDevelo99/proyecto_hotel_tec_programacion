import React from 'react';
import { Bell, Search } from 'lucide-react';
import './TopBar.css';

const TopBar = ({ title }) => {
  return (
    <header className="topbar">
      <div className="topbar-left animate-slide-up">
        <h1 className="page-title">{title || 'Dashboard'}</h1>
        <p className="page-subtitle">Bienvenido de nuevo, gestionemos el hotel.</p>
      </div>

      <div className="topbar-right animate-slide-up animate-delay-100">
        <div className="search-bar glass-panel">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Buscar reservas, clientes..." className="search-input" />
        </div>
        
        <button className="notification-btn glass-panel">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
