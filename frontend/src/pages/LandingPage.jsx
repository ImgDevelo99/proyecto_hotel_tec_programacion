import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BedDouble, Coffee, Star, MapPin, ChevronRight, CalendarCheck, Sparkles, Phone, Mail } from 'lucide-react';
import './LandingPage.css';

const HERO_IMAGES = [
    'https://www.korusgroup.com/wp-content/uploads/2023/02/luxury-hotel-design-build.jpg',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80'
];

const LandingPage = () => {
  const [data, setData] = useState({ habitaciones: [], servicios: [], paquetes: [] });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/public/landing-data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error loading landing data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Slider interval
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBookNow = () => {
    if (isAuthenticated) {
      navigate(user?.role === 2 ? '/mi-portal' : '/admin');
    } else {
      navigate('/login');
    }
  };

  const fmtMoney = (n) => `$${parseFloat(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

  return (
    <div className="landing-root">
      {/* ── NAVBAR ── */}
      <nav className="landing-nav">
        <div className="landing-container nav-content">
          <div className="brand">
            <div className="brand-icon">H</div>
            <span>HotelSys</span>
          </div>
          <div className="nav-links">
            <a href="#habitaciones">Habitaciones</a>
            <a href="#servicios">Servicios</a>
            <a href="#paquetes">Paquetes</a>
          </div>
          <div className="nav-actions">
            {isAuthenticated ? (
               <button className="btn-primary" onClick={handleBookNow}>Mi Panel <ChevronRight size={16}/></button>
            ) : (
               <>
                 <Link to="/login" className="btn-text">Iniciar Sesión</Link>
                 <Link to="/register" className="btn-primary">Regístrate</Link>
               </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <header className="hero-section">
        {HERO_IMAGES.map((img, idx) => (
          <div 
            key={idx}
            className={`hero-bg ${idx === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="hero-overlay"></div>
        <div className="landing-container hero-content" style={{ display: 'block', width: '100%' }}>
          <h1 className="hero-title">Vive una experiencia<br/>inolvidable con nosotros</h1>
          <p className="hero-subtitle">Descubre el confort, la elegancia y el servicio excepcional que te mereces. Reserva hoy y haz de tus vacaciones un recuerdo perfecto.</p>
          <div className="hero-buttons">
            <button className="btn-large btn-primary" onClick={handleBookNow}>
               <CalendarCheck size={20}/> Reserva tu Estancia
            </button>
            <a href="#habitaciones" className="btn-large btn-outline">
               Explorar Habitaciones
            </a>
          </div>
        </div>
        
        {/* Slider Indicators */}
        <div className="slider-indicators">
          {HERO_IMAGES.map((_, idx) => (
            <button 
              key={idx} 
              className={`indicator ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </header>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Cargando experiencias...</p>
        </div>
      ) : (
        <>
          {/* ── HABITACIONES SECTION ── */}
          <section id="habitaciones" className="landing-section">
            <div className="landing-container">
              <div className="section-header">
                <h2>Nuestras Habitaciones</h2>
                <p>Diseñadas para tu máximo confort y descanso.</p>
              </div>
              <div className="grid-rooms">
                {data.habitaciones.slice(0, 6).map(hab => (
                  <div key={hab.IDHabitacion} className="room-card glass-panel">
                    <div className="room-img-wrapper">
                      {hab.ImagenHabitacion ? (
                        <img src={hab.ImagenHabitacion} alt={hab.NombreHabitacion} className="room-img"/>
                      ) : (
                        <div className="room-ph"><BedDouble size={40}/></div>
                      )}
                      <div className="room-price">{fmtMoney(hab.Costo)}<span> / noche</span></div>
                    </div>
                    <div className="room-info">
                      <h3>{hab.NombreHabitacion}</h3>
                      <p>{hab.Descripcion}</p>
                      <button className="btn-outline-sm" onClick={handleBookNow}>Reservar <ChevronRight size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PAQUETES SECTION ── */}
          {data.paquetes.length > 0 && (
            <section id="paquetes" className="landing-section section-dark">
              <div className="landing-container">
                <div className="section-header">
                  <h2>Paquetes Especiales</h2>
                  <p>Ahorra más combinando habitaciones y servicios exclusivos.</p>
                </div>
                <div className="grid-packages">
                  {data.paquetes.slice(0, 3).map(pkg => (
                    <div key={pkg.IDPaquete} className="package-card">
                      <div className="pkg-badge"><Sparkles size={14}/> Recomendado</div>
                      <h3>{pkg.NombrePaquete}</h3>
                      <p className="pkg-desc">{pkg.Descripcion}</p>
                      <div className="pkg-price">{fmtMoney(pkg.Precio)}</div>
                      <button className="btn-primary" onClick={handleBookNow} style={{width:'100%'}}>Aprovechar Paquete</button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── SERVICIOS SECTION ── */}
          <section id="servicios" className="landing-section">
            <div className="landing-container">
              <div className="section-header">
                <h2>Servicios Premium</h2>
                <p>Complementa tu estadía con nuestras comodidades de primer nivel.</p>
              </div>
              <div className="grid-services">
                {data.servicios.slice(0, 8).map(svc => (
                  <div key={svc.IDServicio} className="service-card glass-panel">
                    <div className="svc-icon"><Coffee size={24}/></div>
                    <div>
                      <h4>{svc.NombreServicio}</h4>
                      <p>{svc.Descripcion}</p>
                      <span className="svc-price">Desde {fmtMoney(svc.Costo)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="landing-container footer-content">
          <div className="footer-col">
            <div className="brand" style={{marginBottom:'16px'}}>
              <div className="brand-icon">H</div>
              <span>HotelSys</span>
            </div>
            <p style={{color:'var(--color-text-muted)', fontSize:'0.9rem'}}>El mejor destino para tu descanso y aventura. Vive la experiencia de lujo.</p>
          </div>
          <div className="footer-col">
            <h4>Enlaces Rápidos</h4>
            <a href="#habitaciones">Habitaciones</a>
            <a href="#servicios">Servicios</a>
            <a href="#paquetes">Paquetes</a>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <p><MapPin size={14} style={{marginRight:'8px'}}/> 123 Avenida Principal, Ciudad</p>
            <p><Phone size={14} style={{marginRight:'8px'}}/> +57 311 565 4554</p>
            <p><Mail size={14} style={{marginRight:'8px'}}/> reservas@hotelsys.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} WebTechSolutions SAS. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* ── WHATSAPP FLOATING BUTTON ── */}
      <a 
        href="https://wa.me/573115654554?text=Hola,%20me%20gustaría%20obtener%20más%20información%20sobre%20sus%20reservas." 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-float"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        <span className="whatsapp-tooltip">¡Habla con nosotros!</span>
      </a>
    </div>
  );
};

export default LandingPage;
