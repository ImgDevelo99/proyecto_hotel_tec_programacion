import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BedDouble, Coffee, Star, MapPin, ChevronRight, CalendarCheck, Wind, Leaf, Mountain, Phone, Mail, ArrowDown } from 'lucide-react';
import './LandingPage.css';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-c6a4d1409b1c?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80'
];

const STATS = [
  { value: '500+', label: 'Huéspedes felices', icon: <Star size={20}/> },
  { value: '15+', label: 'Años de experiencia', icon: <Leaf size={20}/> },
  { value: '40+', label: 'Habitaciones únicas', icon: <BedDouble size={20}/> },
  { value: '98%', label: 'Satisfacción', icon: <Wind size={20}/> },
];

const LandingPage = () => {
  const [data, setData] = useState({ habitaciones: [], servicios: [], paquetes: [] });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/public/landing-data');
        const json = await res.json();
        setData(json);
      } catch (err) { console.error('Error loading landing data', err); }
      finally { setLoading(false); }
    };
    fetchData();

    const slideInterval = setInterval(() =>
      setCurrentSlide(prev => (prev + 1) % HERO_IMAGES.length), 6000);

    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(slideInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleBookNow = () => {
    if (isAuthenticated) navigate(user?.role === 2 ? '/mi-portal' : '/admin');
    else navigate('/login');
  };

  const fmt = (n) => `$${parseFloat(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

  return (
    <div className="lp-root">

      {/* ── FLOATING PARTICLES (CSS-driven) ── */}
      <div className="lp-particles" aria-hidden="true">
        {[...Array(12)].map((_, i) => <div key={i} className="particle" style={{ '--i': i }} />)}
      </div>

      {/* ── NAVBAR ── */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-container lp-nav-inner">
          <div className="lp-brand">
            <div className="lp-brand-icon">
              <Leaf size={18} />
            </div>
            <span className="lp-brand-name">Verde Natura</span>
          </div>
          <div className="lp-nav-links">
            <a href="#habitaciones">Habitaciones</a>
            <a href="#paquetes">Experiencias</a>
            <a href="#servicios">Bienestar</a>
            <a href="#contacto">Contacto</a>
          </div>
          <div className="lp-nav-actions">
            {isAuthenticated ? (
              <button className="lp-btn-primary" onClick={handleBookNow}>
                Mi Panel <ChevronRight size={14}/>
              </button>
            ) : (
              <>
                <Link to="/login" className="lp-btn-ghost">Iniciar Sesión</Link>
                <Link to="/register" className="lp-btn-primary">Reservar Ahora</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="lp-hero" ref={heroRef}>
        {/* Slider backgrounds */}
        {HERO_IMAGES.map((img, idx) => (
          <div
            key={idx}
            className={`lp-hero-bg ${idx === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="lp-hero-overlay" />

        {/* Organic SVG leaf shape overlay */}
        <div className="lp-hero-leaf-overlay" aria-hidden="true" />

        <div className="lp-container lp-hero-content">
          <div className="lp-hero-eyebrow">
            <Leaf size={14} />
            <span>Hotel Boutique & Naturaleza</span>
          </div>
          <h1 className="lp-hero-title">
            Donde la Naturaleza<br/>
            <em>te Abraza</em>
          </h1>
          <p className="lp-hero-subtitle">
            Un refugio exclusivo en el corazón del bosque. Vive la armonía perfecta
            entre lujo, bienestar y la serenidad de la naturaleza.
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn-hero-primary" onClick={handleBookNow}>
              <CalendarCheck size={18}/> Reservar Estancia
            </button>
            <a href="#habitaciones" className="lp-btn-hero-outline">
              Explorar <ArrowDown size={16}/>
            </a>
          </div>

          {/* Slide indicators */}
          <div className="lp-slide-dots">
            {HERO_IMAGES.map((_, idx) => (
              <button
                key={idx}
                className={`lp-dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <a href="#stats" className="lp-scroll-hint">
          <ArrowDown size={20}/>
        </a>
      </header>

      {/* ── STATS BAR ── */}
      <section id="stats" className="lp-stats-bar">
        <div className="lp-container lp-stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="lp-stat-item">
              <div className="lp-stat-icon">{s.icon}</div>
              <div>
                <div className="lp-stat-value">{s.value}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HABITACIONES ── */}
      <section id="habitaciones" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-tag"><Leaf size={13}/> Nuestros Espacios</div>
            <h2 className="lp-section-title">Habitaciones que Inspiran</h2>
            <p className="lp-section-subtitle">
              Cada habitación es un santuario de calma, diseñada con materiales naturales
              y vistas al entorno boscoso.
            </p>
          </div>

          {loading ? (
            <div className="lp-loader"><div className="lp-spinner"/></div>
          ) : (
            <div className="lp-rooms-grid">
              {data.habitaciones.slice(0, 6).map((h, i) => (
                <div key={i} className="lp-room-card">
                  <div className="lp-room-img-wrap">
                    <img
                      src={h.ImagenHabitacion || `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80`}
                      alt={h.NombreHabitacion || 'Habitación'}
                      className="lp-room-img"
                      loading="lazy"
                    />
                    <div className="lp-room-badge">Disponible</div>
                  </div>
                  <div className="lp-room-body">
                    <h3 className="lp-room-title">{h.NombreHabitacion || `Suite ${i + 1}`}</h3>
                    <p className="lp-room-desc">{h.Descripcion || 'Un espacio acogedor en armonía con la naturaleza.'}</p>
                    <div className="lp-room-footer">
                      <div className="lp-room-price">
                        <span className="lp-price-amount">{fmt(h.Costo)}</span>
                        <span className="lp-price-label">/noche</span>
                      </div>
                      <button className="lp-btn-room" onClick={handleBookNow}>Reservar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── NATURE BREAK BANNER ── */}
      <section className="lp-nature-banner">
        <div className="lp-nature-banner-overlay"/>
        <div className="lp-container lp-nature-banner-content">
          <Mountain size={48} className="lp-nature-icon" />
          <h2>"La naturaleza no tiene prisa,<br/>y sin embargo todo se logra."</h2>
          <p>— Lao Tzu</p>
          <button className="lp-btn-hero-primary" onClick={handleBookNow}>
            Comienza tu Escapada
          </button>
        </div>
      </section>

      {/* ── PAQUETES ── */}
      <section id="paquetes" className="lp-section lp-section-alt">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-tag"><Star size={13}/> Experiencias</div>
            <h2 className="lp-section-title">Paquetes Curados</h2>
            <p className="lp-section-subtitle">Experiencias diseñadas para reconectar contigo mismo y con la naturaleza.</p>
          </div>

          {loading ? <div className="lp-loader"><div className="lp-spinner"/></div> : (
            <div className="lp-pkg-grid">
              {data.paquetes.slice(0, 4).map((p, i) => (
                <div key={i} className="lp-pkg-card">
                  <div className="lp-pkg-header">
                    <div className="lp-pkg-icon-wrap">
                      <Leaf size={22}/>
                    </div>
                    <div className="lp-pkg-badge">Más popular</div>
                  </div>
                  <h3 className="lp-pkg-title">{p.NombrePaquete}</h3>
                  <p className="lp-pkg-desc">{p.Descripcion || 'Experiencia exclusiva en contacto con la naturaleza.'}</p>
                  <div className="lp-pkg-price">{fmt(p.Precio)}</div>
                  <button className="lp-btn-pkg" onClick={handleBookNow}>Ver Paquete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-header">
            <div className="lp-tag"><Wind size={13}/> Bienestar</div>
            <h2 className="lp-section-title">Servicios Premium</h2>
            <p className="lp-section-subtitle">Todo lo que necesitas para una estadía perfecta.</p>
          </div>

          {loading ? <div className="lp-loader"><div className="lp-spinner"/></div> : (
            <div className="lp-svc-grid">
              {data.servicios.slice(0, 6).map((s, i) => (
                <div key={i} className="lp-svc-card">
                  <div className="lp-svc-icon"><Coffee size={24}/></div>
                  <h4 className="lp-svc-title">{s.NombreServicio}</h4>
                  <p className="lp-svc-desc">{s.Descripcion || 'Servicio de primera calidad.'}</p>
                  <div className="lp-svc-price">{fmt(s.Costo)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contacto" className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-container lp-footer-grid">
            <div className="lp-footer-brand">
              <div className="lp-brand">
                <div className="lp-brand-icon"><Leaf size={18}/></div>
                <span className="lp-brand-name">Verde Natura</span>
              </div>
              <p>Un refugio de lujo y naturaleza donde cada momento se convierte en un recuerdo eterno.</p>
              <div className="lp-footer-socials">
                {['f', 'ig', 'tw'].map(s => <button key={s} className="lp-social-btn">{s}</button>)}
              </div>
            </div>
            <div className="lp-footer-col">
              <h4>Explorar</h4>
              <a href="#habitaciones">Habitaciones</a>
              <a href="#paquetes">Paquetes</a>
              <a href="#servicios">Servicios</a>
            </div>
            <div className="lp-footer-col">
              <h4>Contacto</h4>
              <p><MapPin size={14}/> Km 5 Vía al Bosque, Colombia</p>
              <p><Phone size={14}/> +57 311 565 4554</p>
              <p><Mail size={14}/> reservas@verdenaturahotel.com</p>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Verde Natura Hotel · WebTechSolutions SAS. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* ── WHATSAPP BUTTON ── */}
      <a
        href="https://wa.me/573115654554?text=Hola,%20me%20gustaría%20obtener%20más%20información%20sobre%20sus%20reservas."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        <span className="whatsapp-tooltip">¡Habla con nosotros!</span>
      </a>
    </div>
  );
};

export default LandingPage;
