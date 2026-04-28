import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './TopBar.css';

const TopBar = ({ title }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notificaciones');
      const data = Array.isArray(res) ? res : [];
      setNotifications(data);
      const unread = data.filter(n => n.Leida === 0).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, idReserva) => {
    try {
      await api.put(`/notificaciones/${id}/marcar-leida`);
      fetchNotifications();
      if (idReserva) {
        navigate('/admin/reservas');
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notificaciones/marcar-todas/todas');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

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
        
        <div className="notification-container" ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            className="notification-btn glass-panel" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          {showDropdown && (
            <div className="notification-dropdown glass-panel">
              <div className="notif-header">
                <h3>Notificaciones</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-btn" onClick={handleMarkAllRead}>
                    <CheckCircle2 size={14}/> Marcar todo
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No tienes notificaciones</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.IdNotificacion} 
                      className={`notif-item ${notif.Leida === 0 ? 'unread' : ''}`}
                      onClick={() => handleMarkAsRead(notif.IdNotificacion, notif.IDReservaAsociada)}
                    >
                      <div className="notif-icon-wrap">
                        <Bell size={16} />
                      </div>
                      <div className="notif-content">
                        <p>{notif.Mensaje}</p>
                        <span className="notif-time">{new Date(notif.FechaCreacion).toLocaleTimeString()}</span>
                      </div>
                      {notif.Leida === 0 && <div className="notif-dot"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
