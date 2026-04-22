import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User, CalendarCheck, BedDouble, Plus, X, LogOut,
  Clock, CheckCircle2, XCircle, Star, ChevronRight,
  Loader2, RefreshCw, ArrowLeft, Coffee, PackageOpen,
  CreditCard, FileText, MapPin, Phone, Hash,
  AlertCircle, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import './ClientePortal.css';

const API = 'http://localhost:3000/api/portal';

const authFetch = (url, opts = {}) => {
  const token = localStorage.getItem('hotelsys_token');
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers }
  });
};

const STATUS_CONFIG = {
  'Confirmada': { color: '#34d399', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle2 size={13}/> },
  'Pendiente':  { color: '#facc15', bg: 'rgba(250,204,21,0.12)',  icon: <Clock size={13}/> },
  'Anulada':    { color: '#f87171', bg: 'rgba(239,68,68,0.12)',   icon: <XCircle size={13}/> },
  'Finalizada': { color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)', icon: <Star size={13}/> },
};

const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: null };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'4px 12px',
      borderRadius:'20px', fontSize:'0.78rem', fontWeight:'600',
      color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.color}33`
    }}>
      {cfg.icon} {status || 'Desconocido'}
    </span>
  );
};

const fmt   = d => d ? new Date(d).toLocaleDateString('es-CO', {day:'2-digit',month:'short',year:'numeric'}) : '—';
const money  = n => `$${parseFloat(n||0).toLocaleString('es-CO',{minimumFractionDigits:0})}`;
const nights = (a,b) => !a||!b ? 0 : Math.max(1,Math.ceil((new Date(b)-new Date(a))/86400000));

// ─────────────────────────────────────────────────────
// STEP RESERVATION FORM
// ─────────────────────────────────────────────────────
const ReservationWizard = ({ habitaciones, catalogos, perfil, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    IDHabitacion: '',
    FechaInicio: '',
    FechaFinalizacion: '',
    MetodoPago: '',
    NroDocumentoCliente: perfil?.NumeroDocumento || '',
    servicios: [],   // [{ IDServicio, Cantidad }]
    paquetes: [],    // [{ IDPaquete, Cantidad }]
    Descuento: 0,
  });

  const hab      = habitaciones.find(h => h.IDHabitacion === parseInt(form.IDHabitacion));
  const noches   = nights(form.FechaInicio, form.FechaFinalizacion);
  const precioHab = hab ? parseFloat(hab.Costo) * noches : 0;

  const precioServicios = form.servicios.reduce((acc, s) => {
    const sv = catalogos.servicios?.find(x => x.IDServicio === s.IDServicio);
    return acc + (sv ? parseFloat(sv.Costo) * s.Cantidad : 0);
  }, 0);

  const precioPaquetes = form.paquetes.reduce((acc, p) => {
    const pk = catalogos.paquetes?.find(x => x.IDPaquete === p.IDPaquete);
    return acc + (pk ? parseFloat(pk.Precio) * p.Cantidad : 0);
  }, 0);

  const subTotal   = precioHab + precioServicios + precioPaquetes;
  const descuento  = parseFloat(form.Descuento) || 0;
  const base       = subTotal - descuento;
  const iva        = base * 0.19;
  const total      = base + iva;

  const today = new Date().toISOString().split('T')[0];

  const toggleServicio = (id) => {
    setForm(f => f.servicios.find(s=>s.IDServicio===id)
      ? { ...f, servicios: f.servicios.filter(s=>s.IDServicio!==id) }
      : { ...f, servicios: [...f.servicios, { IDServicio: id, Cantidad: 1 }] }
    );
  };

  const togglePaquete = (id) => {
    setForm(f => f.paquetes.find(p=>p.IDPaquete===id)
      ? { ...f, paquetes: f.paquetes.filter(p=>p.IDPaquete!==id) }
      : { ...f, paquetes: [...f.paquetes, { IDPaquete: id, Cantidad: 1 }] }
    );
  };

  const canStep2 = form.IDHabitacion && form.FechaInicio && form.FechaFinalizacion && noches > 0;
  const canStep3 = canStep2 && form.MetodoPago && form.NroDocumentoCliente;

  const handleSubmit = async () => {
    if (!canStep3) return;
    setSaving(true);
    try {
      const res = await authFetch(`${API}/reservar`, {
        method: 'POST',
        body: JSON.stringify({
          NroDocumentoCliente: form.NroDocumentoCliente,
          FechaInicio: form.FechaInicio,
          FechaFinalizacion: form.FechaFinalizacion,
          MetodoPago: parseInt(form.MetodoPago),
          IDHabitacion: parseInt(form.IDHabitacion),
          servicios: form.servicios,
          paquetes: form.paquetes,
          Descuento: form.Descuento,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSuccess(data);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  // ── STEP 1: HABITACIÓN + FECHAS ─────────────────────
  const Step1 = () => (
    <div>
      <h3 className="wiz-step-title">Elige tu habitación y fechas</h3>

      {/* Habitaciones gallery */}
      <div className="hab-gallery">
        {habitaciones.map(h => {
          const sel = form.IDHabitacion === String(h.IDHabitacion);
          return (
            <div key={h.IDHabitacion}
              className={`hab-card ${sel ? 'selected' : ''}`}
              onClick={() => setForm(f => ({...f, IDHabitacion: String(h.IDHabitacion)}))}
            >
              {h.ImagenHabitacion
                ? <img src={h.ImagenHabitacion} alt={h.NombreHabitacion} className="hab-img"/>
                : <div className="hab-img-ph"><BedDouble size={32}/></div>
              }
              <div className="hab-info">
                <p className="hab-name">{h.NombreHabitacion}</p>
                <p className="hab-desc">{h.Descripcion}</p>
                <p className="hab-price">{money(h.Costo)}<span>/noche</span></p>
              </div>
              {sel && <div className="hab-check"><CheckCircle2 size={18}/></div>}
            </div>
          );
        })}
      </div>

      {/* Fechas */}
      <div className="date-row">
        <div>
          <label className="cp-label">📅 Fecha de Entrada</label>
          <input className="cp-input" type="date" min={today}
            value={form.FechaInicio}
            onChange={e => setForm(f => ({...f, FechaInicio: e.target.value, FechaFinalizacion: f.FechaFinalizacion && f.FechaFinalizacion <= e.target.value ? '' : f.FechaFinalizacion}))}
          />
        </div>
        <div>
          <label className="cp-label">📅 Fecha de Salida</label>
          <input className="cp-input" type="date"
            min={form.FechaInicio ? new Date(new Date(form.FechaInicio).getTime()+86400000).toISOString().split('T')[0] : today}
            value={form.FechaFinalizacion}
            onChange={e => setForm(f => ({...f, FechaFinalizacion: e.target.value}))}
          />
        </div>
      </div>

      {/* Mini resumen */}
      {hab && noches > 0 && (
        <div className="mini-resumen">
          <span>🛏️ {hab.NombreHabitacion}</span>
          <span>•</span>
          <span>{noches} noche{noches!==1?'s':''}</span>
          <span>•</span>
          <strong>{money(precioHab)}</strong>
        </div>
      )}

      <div className="wiz-nav">
        <button className="cp-btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="cp-btn-primary" onClick={() => setStep(2)} disabled={!canStep2}>
          Continuar <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );

  // ── STEP 2: SERVICIOS Y PAQUETES ─────────────────────
  const Step2 = () => (
    <div>
      <h3 className="wiz-step-title">Servicios y Paquetes adicionales <span style={{fontSize:'0.8rem',fontWeight:'400',color:'var(--color-text-muted)'}}>(Opcional)</span></h3>

      {catalogos.servicios?.length > 0 && (
        <div style={{marginBottom:'24px'}}>
          <p className="cp-label" style={{fontSize:'0.95rem',fontWeight:'600',color:'white',marginBottom:'12px'}}>
            <Coffee size={16} style={{marginRight:'6px',verticalAlign:'middle'}}/> Servicios disponibles
          </p>
          <div className="extras-grid">
            {catalogos.servicios.map(s => {
              const sel = form.servicios.find(x=>x.IDServicio===s.IDServicio);
              return (
                <div key={s.IDServicio} className={`extra-card ${sel?'selected':''}`} onClick={() => toggleServicio(s.IDServicio)}>
                  <div style={{flex:1}}>
                    <p className="extra-name">{s.NombreServicio}</p>
                    <p className="extra-desc">{s.Descripcion} · {s.Duracion}</p>
                    <p className="extra-price">{money(s.Costo)}</p>
                  </div>
                  <div className={`extra-check ${sel?'active':''}`}>
                    {sel ? <CheckCircle2 size={16}/> : <Plus size={16}/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {catalogos.paquetes?.length > 0 && (
        <div>
          <p className="cp-label" style={{fontSize:'0.95rem',fontWeight:'600',color:'white',marginBottom:'12px'}}>
            <PackageOpen size={16} style={{marginRight:'6px',verticalAlign:'middle'}}/> Paquetes especiales
          </p>
          <div className="extras-grid">
            {catalogos.paquetes.map(p => {
              const sel = form.paquetes.find(x=>x.IDPaquete===p.IDPaquete);
              return (
                <div key={p.IDPaquete} className={`extra-card ${sel?'selected':''}`} onClick={() => togglePaquete(p.IDPaquete)}>
                  <div style={{flex:1}}>
                    <p className="extra-name"><Sparkles size={14} style={{marginRight:'4px',verticalAlign:'middle'}}/> {p.NombrePaquete}</p>
                    <p className="extra-desc">{p.Descripcion}</p>
                    <p className="extra-price">{money(p.Precio)}</p>
                  </div>
                  <div className={`extra-check ${sel?'active':''}`}>
                    {sel ? <CheckCircle2 size={16}/> : <Plus size={16}/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price preview steps */}
      <PriceSummary {...{precioHab, precioServicios, precioPaquetes, subTotal, descuento, iva, total, noches, form, catalogos}}/>

      <div className="wiz-nav">
        <button className="cp-btn-secondary" onClick={() => setStep(1)}><ArrowLeft size={16}/> Atrás</button>
        <button className="cp-btn-primary" onClick={() => setStep(3)}>
          Continuar <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );

  // ── STEP 3: PAGO + CONFIRMACIÓN ──────────────────────
  const Step3 = () => (
    <div>
      <h3 className="wiz-step-title">Datos de Pago y Confirmación</h3>

      <div className="cp-grid-2" style={{marginBottom:'20px'}}>
        <div>
          <label className="cp-label"><Hash size={14} style={{verticalAlign:'middle',marginRight:'4px'}}/> Número de Documento</label>
          <input className="cp-input" type="text" placeholder="Tu cédula / pasaporte"
            value={form.NroDocumentoCliente}
            onChange={e => setForm(f=>({...f,NroDocumentoCliente:e.target.value}))}
            required
          />
          <p style={{fontSize:'0.78rem',color:'var(--color-text-muted)',marginTop:'4px'}}>Requerido para procesar tu reserva</p>
        </div>
        <div>
          <label className="cp-label"><CreditCard size={14} style={{verticalAlign:'middle',marginRight:'4px'}}/> Método de Pago</label>
          <select className="cp-input" value={form.MetodoPago} onChange={e=>setForm(f=>({...f,MetodoPago:e.target.value}))} required>
            <option value="">Seleccionar...</option>
            {catalogos.metodos?.map(m=><option key={m.IdMetodoPago} value={m.IdMetodoPago}>{m.NomMetodoPago}</option>)}
          </select>
        </div>
      </div>

      {!form.NroDocumentoCliente && (
        <div className="alert-warning">
          <AlertCircle size={16}/>
          Completa tu número de documento. Puedes guardarlo permanentemente en la sección <strong>Mi Perfil</strong>.
        </div>
      )}

      {/* Resumen Final */}
      <div className="resumen-final">
        <h4 style={{margin:'0 0 16px',fontWeight:'700',fontSize:'1rem'}}>📋 Resumen de tu Reserva</h4>
        <div className="resumen-row">
          <span>🛏️ Habitación</span>
          <span>{hab?.NombreHabitacion}</span>
        </div>
        <div className="resumen-row">
          <span>📅 Entrada</span>
          <span>{fmt(form.FechaInicio)}</span>
        </div>
        <div className="resumen-row">
          <span>📅 Salida</span>
          <span>{fmt(form.FechaFinalizacion)}</span>
        </div>
        <div className="resumen-row">
          <span>🌙 Noches</span>
          <span>{noches}</span>
        </div>
        {form.servicios.length > 0 && (
          <div className="resumen-row">
            <span>☕ Servicios</span>
            <span>{form.servicios.length} seleccionado(s)</span>
          </div>
        )}
        {form.paquetes.length > 0 && (
          <div className="resumen-row">
            <span>📦 Paquetes</span>
            <span>{form.paquetes.length} seleccionado(s)</span>
          </div>
        )}
        <hr style={{border:'none',borderTop:'1px solid rgba(255,255,255,0.07)',margin:'12px 0'}}/>
        <div className="resumen-row"><span>Subtotal</span><span>{money(subTotal)}</span></div>
        <div className="resumen-row"><span>IVA (19%)</span><span>{money(iva)}</span></div>
        <div className="resumen-row total-row">
          <span>💰 Total a Pagar</span>
          <span>{money(total)}</span>
        </div>
      </div>

      <div className="wiz-nav">
        <button className="cp-btn-secondary" onClick={() => setStep(2)}><ArrowLeft size={16}/> Atrás</button>
        <button className="cp-btn-primary" onClick={handleSubmit} disabled={!canStep3 || saving} style={{minWidth:'180px'}}>
          {saving ? <><Loader2 size={16} className="spin"/> Procesando...</> : <>✅ Confirmar Reserva</>}
        </button>
      </div>
    </div>
  );

  const steps = [
    { num:1, label:'Habitación & Fechas' },
    { num:2, label:'Extras' },
    { num:3, label:'Confirmación' },
  ];

  return (
    <div className="wizard-container glass-panel">
      {/* Stepper */}
      <div className="stepper">
        {steps.map((s,i) => (
          <React.Fragment key={s.num}>
            <div className={`step-item ${step===s.num?'active':''} ${step>s.num?'done':''}`}>
              <div className="step-circle">{step>s.num ? '✓' : s.num}</div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < steps.length-1 && <div className={`step-line ${step>s.num+1||step>i+1?'done':''}`}/>}
          </React.Fragment>
        ))}
      </div>

      <div className="wizard-body">
        {step === 1 && <Step1/>}
        {step === 2 && <Step2/>}
        {step === 3 && <Step3/>}
      </div>
    </div>
  );
};

// ── Price Summary Component ─────────────────────────────────────────────────
const PriceSummary = ({ precioHab, precioServicios, precioPaquetes, subTotal, iva, total, noches }) => (
  <div className="price-summary">
    <p style={{margin:'0 0 12px',fontWeight:'600',fontSize:'0.9rem',color:'white'}}>💵 Resumen de Precios</p>
    <div className="price-row"><span>Habitación ({noches} noche{noches!==1?'s':''})</span><span>{money(precioHab)}</span></div>
    {precioServicios > 0 && <div className="price-row"><span>Servicios</span><span>{money(precioServicios)}</span></div>}
    {precioPaquetes > 0 && <div className="price-row"><span>Paquetes</span><span>{money(precioPaquetes)}</span></div>}
    <div className="price-row sub"><span>Subtotal</span><span>{money(subTotal)}</span></div>
    <div className="price-row"><span>IVA (19%)</span><span>{money(iva)}</span></div>
    <div className="price-row total"><span>Total estimado</span><span>{money(total)}</span></div>
  </div>
);

// ── SUCCESS SCREEN ─────────────────────────────────────────────────────────
const SuccessScreen = ({ data, onBack }) => (
  <div style={{textAlign:'center',padding:'48px 24px'}}>
    <div style={{fontSize:'4rem',marginBottom:'16px'}}>🎉</div>
    <h2 style={{margin:'0 0 8px',fontSize:'1.5rem'}}>¡Reserva Confirmada!</h2>
    <p style={{color:'var(--color-text-muted)',marginBottom:'24px'}}>Tu reserva #{data.id} ha sido registrada exitosamente.</p>
    <div className="price-summary" style={{maxWidth:'320px',margin:'0 auto 28px'}}>
      <div className="price-row total"><span>Total a Pagar</span><span>{money(data.resumen?.montoTotal)}</span></div>
    </div>
    <p style={{color:'var(--color-text-muted)',fontSize:'0.85rem',marginBottom:'24px'}}>Pronto recibirás la confirmación. El estado inicial es <strong>Pendiente</strong>.</p>
    <button className="cp-btn-primary" onClick={onBack}>Ver mis Reservas</button>
  </div>
);

// ── MAIN PORTAL ─────────────────────────────────────────────────────────────
const ClientePortal = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab]           = useState('reservas');
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [catalogos, setCatalogos]   = useState({});
  const [perfil, setPerfil]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [perfilForm, setPerfilForm] = useState({});
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resData, habData, catData, perfilData] = await Promise.all([
        authFetch(`${API}/mis-reservas`).then(r=>r.json()),
        authFetch(`${API}/habitaciones-disponibles`).then(r=>r.json()),
        authFetch(`${API}/catalogos`).then(r=>r.json()),
        authFetch(`${API}/mi-perfil`).then(r=>r.json()),
      ]);
      setReservas(Array.isArray(resData) ? resData : []);
      setHabitaciones(Array.isArray(habData) ? habData : []);
      setCatalogos(catData||{});
      setPerfil(perfilData);
      setPerfilForm(perfilData||{});
    } catch { showToast('Error cargando información', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCancelar = async (res) => {
    if (!window.confirm('¿Deseas cancelar esta reserva?')) return;
    try {
      const r = await authFetch(`${API}/reservas/${res.IdReserva}`, {method:'DELETE'});
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      showToast('Reserva cancelada');
      loadData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleSavePerfil = async (e) => {
    e.preventDefault();
    setSavingPerfil(true);
    try {
      const r = await authFetch(`${API}/mi-perfil`,{method:'PUT',body:JSON.stringify(perfilForm)});
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      showToast('Perfil actualizado');
      loadData();
    } catch (err) { showToast(err.message,'error'); }
    finally { setSavingPerfil(false); }
  };

  const initials = (perfil?.NombreUsuario||user?.name||'CL').substring(0,2).toUpperCase();

  const stats = [
    { icon:<CalendarCheck size={20}/>, label:'Total',       val:reservas.length,                              color:'var(--color-primary)' },
    { icon:<CheckCircle2  size={20}/>, label:'Confirmadas', val:reservas.filter(r=>r.NombreEstadoReserva==='Confirmada').length,  color:'#34d399' },
    { icon:<Clock         size={20}/>, label:'Pendientes',  val:reservas.filter(r=>r.NombreEstadoReserva==='Pendiente').length,   color:'#facc15' },
    { icon:<Star          size={20}/>, label:'Finalizadas', val:reservas.filter(r=>r.NombreEstadoReserva==='Finalizada').length,  color:'#a5b4fc' },
  ];

  return (
    <div className="cp-root">
      {/* ── Sidebar ── */}
      <aside className="cp-sidebar glass-panel">
        <div className="cp-brand"><div className="cp-brand-icon">H</div><span>HotelSys</span></div>

        <div className="cp-avatar-block">
          <div className="cp-avatar-circle">{initials}</div>
          <p className="cp-avatar-name">{perfil?.NombreUsuario||user?.name} {perfil?.Apellido||''}</p>
          <p className="cp-avatar-role">Portal Cliente</p>
          {/* Mini stats */}
          <div style={{display:'flex',gap:'8px',marginTop:'12px',justifyContent:'center'}}>
            {stats.slice(0,3).map((s,i)=>(
              <div key={i} style={{textAlign:'center',padding:'6px 10px',background:'rgba(255,255,255,0.05)',borderRadius:'8px'}}>
                <p style={{margin:0,fontSize:'1rem',fontWeight:'700',color:s.color}}>{s.val}</p>
                <p style={{margin:0,fontSize:'0.65rem',color:'var(--color-text-muted)'}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <nav className="cp-nav">
          {[
            {key:'reservas', icon:<CalendarCheck size={20}/>, label:'Mis Reservas'},
            {key:'nueva',    icon:<Plus size={20}/>,          label:'Nueva Reserva'},
            {key:'perfil',   icon:<User size={20}/>,          label:'Mi Perfil'},
          ].map(item=>(
            <button key={item.key}
              className={`cp-nav-item ${tab===item.key?'active':''}`}
              onClick={()=>{setTab(item.key); setSuccessData(null);}}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button className="cp-logout" onClick={logout}><LogOut size={18}/> Cerrar Sesión</button>
      </aside>

      {/* ── Main ── */}
      <main className="cp-main">
        <div className="cp-topbar">
          <div>
            <h1 className="cp-topbar-title">
              {tab==='reservas'?'Mis Reservas':tab==='nueva'?'Nueva Reserva':'Mi Perfil'}
            </h1>
            <p className="cp-topbar-sub">
              {tab==='reservas'&&`${reservas.length} reserva(s) registradas`}
              {tab==='nueva'&&'Completa el asistente en 3 pasos'}
              {tab==='perfil'&&'Gestiona tu información de contacto'}
            </p>
          </div>
          {tab==='reservas'&&<button className="cp-btn-icon" onClick={loadData}><RefreshCw size={18}/></button>}
        </div>

        {loading ? (
          <div className="cp-loader"><Loader2 size={36} className="spin"/><p>Cargando tu portal...</p></div>
        ) : (
          <>
            {/* ── MIS RESERVAS ──────────────────────── */}
            {tab==='reservas'&&(
              <div>
                {/* Stats row */}
                <div className="cp-stats-row" style={{marginBottom:'28px'}}>
                  {stats.map((s,i)=>(
                    <div key={i} className="glass-panel cp-stat-card">
                      <div style={{color:s.color,marginBottom:'6px'}}>{s.icon}</div>
                      <p style={{margin:0,fontSize:'1.5rem',fontWeight:'700'}}>{s.val}</p>
                      <p style={{margin:'2px 0 0',fontSize:'0.78rem',color:'var(--color-text-muted)'}}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {reservas.length===0?(
                  <div className="cp-empty">
                    <BedDouble size={56} color="var(--color-text-muted)"/>
                    <h3>Aún no tienes reservas</h3>
                    <p>¡Reserva ahora y comienza tu experiencia!</p>
                    <button className="cp-btn-primary" onClick={()=>setTab('nueva')}><Plus size={16}/> Reservar ahora</button>
                  </div>
                ):(
                  <div className="cp-reservas-grid">
                    {reservas.map(r=>(
                      <div key={r.IdReserva} className="cp-reserva-card glass-panel">
                        <div className="cp-reserva-header">
                          <span className="cp-reserva-id">Reserva #<strong>{r.IdReserva}</strong></span>
                          <Badge status={r.NombreEstadoReserva}/>
                        </div>

                        <div className="cp-reserva-dates">
                          <div className="cp-date-block">
                            <span>Check-in</span>
                            <strong>{fmt(r.FechaInicio)}</strong>
                          </div>
                          <ChevronRight size={18} color="var(--color-text-muted)"/>
                          <div className="cp-date-block">
                            <span>Check-out</span>
                            <strong>{fmt(r.FechaFinalizacion)}</strong>
                          </div>
                          <div className="cp-date-block" style={{textAlign:'right'}}>
                            <span>Noches</span>
                            <strong>{nights(r.FechaInicio,r.FechaFinalizacion)}</strong>
                          </div>
                        </div>

                        <div className="cp-reserva-footer">
                          <div style={{fontSize:'0.82rem',color:'var(--color-text-muted)',display:'flex',flexDirection:'column',gap:'3px'}}>
                            <span>💳 {r.NomMetodoPago||'—'}</span>
                            <span>📅 Creada: {fmt(r.FechaReserva)}</span>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <p style={{margin:0,fontSize:'0.72rem',color:'var(--color-text-muted)'}}>Total Pagado</p>
                            <p style={{margin:0,fontWeight:'800',fontSize:'1.15rem',color:'var(--color-primary)'}}>{money(r.MontoTotal)}</p>
                          </div>
                        </div>

                        {r.NombreEstadoReserva?.toLowerCase().includes('pendiente')&&(
                          <button className="cp-btn-danger" onClick={()=>handleCancelar(r)}>
                            <X size={14}/> Cancelar Reserva
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── NUEVA RESERVA ─────────────────────── */}
            {tab==='nueva'&&(
              successData ? (
                <SuccessScreen data={successData} onBack={()=>{setTab('reservas');setSuccessData(null);loadData();}}/>
              ) : (
                <ReservationWizard
                  habitaciones={habitaciones}
                  catalogos={catalogos}
                  perfil={perfil}
                  onSuccess={(data)=>setSuccessData(data)}
                  onCancel={()=>setTab('reservas')}
                />
              )
            )}

            {/* ── MI PERFIL ─────────────────────────── */}
            {tab==='perfil'&&perfil&&(
              <div style={{display:'flex',flexDirection:'column',gap:'20px',maxWidth:'680px'}}>
                {/* Header Card */}
                <div className="glass-panel" style={{padding:'24px',borderRadius:'16px',display:'flex',alignItems:'center',gap:'20px'}}>
                  <div style={{width:'68px',height:'68px',borderRadius:'50%',background:'linear-gradient(135deg,var(--color-primary),var(--color-accent))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',fontWeight:'700',flexShrink:0}}>
                    {initials}
                  </div>
                  <div>
                    <h2 style={{margin:0,fontSize:'1.3rem'}}>{perfil.NombreUsuario} {perfil.Apellido}</h2>
                    <p style={{margin:'4px 0 8px',color:'var(--color-text-muted)',fontSize:'0.88rem'}}>✉️ {perfil.Email}</p>
                    <span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'0.78rem',background:'rgba(99,102,241,0.15)',color:'#a5b4fc',border:'1px solid rgba(99,102,241,0.3)'}}>
                      Cliente HotelSys
                    </span>
                  </div>
                </div>

                {/* Edit form */}
                <div className="glass-panel" style={{padding:'24px',borderRadius:'16px'}}>
                  <h3 style={{margin:'0 0 20px',fontSize:'1rem',display:'flex',alignItems:'center',gap:'8px'}}>
                    <FileText size={18} color="var(--color-primary)"/> Información Personal
                  </h3>
                  <form onSubmit={handleSavePerfil}>
                    <div className="cp-grid-2">
                      <div>
                        <label className="cp-label">Tipo de Documento</label>
                        <select className="cp-input" value={perfilForm.TipoDocumento||''} onChange={e=>setPerfilForm(f=>({...f,TipoDocumento:e.target.value}))}>
                          <option value="">Seleccionar...</option>
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="CE">Cédula de Extranjería</option>
                          <option value="PA">Pasaporte</option>
                          <option value="NIT">NIT</option>
                        </select>
                      </div>
                      <div>
                        <label className="cp-label">Número de Documento</label>
                        <input className="cp-input" type="text" placeholder="1234567890" value={perfilForm.NumeroDocumento||''} onChange={e=>setPerfilForm(f=>({...f,NumeroDocumento:e.target.value}))}/>
                      </div>
                      <div>
                        <label className="cp-label">Teléfono</label>
                        <input className="cp-input" type="tel" placeholder="+57 300 000 0000" value={perfilForm.Telefono||''} onChange={e=>setPerfilForm(f=>({...f,Telefono:e.target.value}))}/>
                      </div>
                      <div>
                        <label className="cp-label">País</label>
                        <input className="cp-input" type="text" placeholder="Colombia" value={perfilForm.Pais||''} onChange={e=>setPerfilForm(f=>({...f,Pais:e.target.value}))}/>
                      </div>
                      <div style={{gridColumn:'1 / -1'}}>
                        <label className="cp-label">Dirección</label>
                        <input className="cp-input" type="text" placeholder="Calle 123 #45-67" value={perfilForm.Direccion||''} onChange={e=>setPerfilForm(f=>({...f,Direccion:e.target.value}))}/>
                      </div>
                    </div>
                    <div style={{display:'flex',justifyContent:'flex-end',marginTop:'20px'}}>
                      <button type="submit" className="cp-btn-primary" disabled={savingPerfil}>
                        {savingPerfil?<><Loader2 size={14} className="spin"/> Guardando...</>:'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ClientePortal;
