import React, { useEffect, useState } from 'react';
import Card from '../components/Card/Card';
import DataTable from '../components/DataTable/DataTable';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import Input from '../components/Input/Input';
import { Plus, CalendarCheck, Trash2, Eye, Edit2, Package, Coffee } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Catalogs
  const [clientes, setClientes] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [estados, setEstados] = useState([]);
  const [metodos, setMetodos] = useState([]);

  // Modal and Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingFull, setIsEditingFull] = useState(false);
  const [selectedReservaToUpdate, setSelectedReservaToUpdate] = useState(null);

  // Detail View
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState({ reserva: null, paquetes: [], servicios: [] });
  const [detailLoading, setDetailLoading] = useState(false);

  const [formData, setFormData] = useState({
    NroDocumentoCliente: '',
    FechaInicio: '',
    FechaFinalizacion: '',
    IdEstadoReserva: '',
    MetodoPago: '',
  });

  // Cart State for reservation details
  const [cartPaquetes, setCartPaquetes] = useState([]); // { paquete, cantidad, precio, idpaquete }
  const [cartServicios, setCartServicios] = useState([]); // { servicio, cantidad, precio, idservicio }
  
  // Selection Selectors Handlers
  const [selectedPaquete, setSelectedPaquete] = useState('');
  const [selectedServicio, setSelectedServicio] = useState('');

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const [resData, cliData, paqData, srvData, estData, metData] = await Promise.all([
        api.get('/reservas'),
        api.get('/clientes'),
        api.get('/paquetes'),
        api.get('/servicios'),
        api.get('/estados-reserva'),
        api.get('/metodos-pago')
      ]);
      setReservas(resData);
      setClientes(cliData);
      setPaquetes(paqData);
      setServicios(srvData);
      setEstados(estData);
      setMetodos(metData);
    } catch (error) {
      showToast('Error cargando la vista de reservas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({
      NroDocumentoCliente: clientes.length > 0 ? clientes[0].NroDocumento : '',
      FechaInicio: new Date().toISOString().slice(0, 10),
      FechaFinalizacion: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      IdEstadoReserva: estados.length > 0 ? estados[0].IdEstadoReserva : '',
      MetodoPago: metodos.length > 0 ? metodos[0].IdMetodoPago : '',
    });
    setCartPaquetes([]);
    setCartServicios([]);
    setSelectedPaquete('');
    setSelectedServicio('');
  };

  const openModal = () => {
    resetForm();
    setIsEditingFull(false);
    setSelectedReservaToUpdate(null);
    setIsModalOpen(true);
  };

  // Cart Management
  const addPaquete = () => {
    if (!selectedPaquete) return;
    const paq = paquetes.find(p => p.IDPaquete === parseInt(selectedPaquete, 10));
    if (paq && !cartPaquetes.find(p => p.idpaquete === paq.IDPaquete)) {
      setCartPaquetes([...cartPaquetes, {
        idpaquete: paq.IDPaquete,
        nombre: paq.NombrePaquete,
        precio: parseFloat(paq.Precio),
        cantidad: 1
      }]);
    }
  };

  const addServicio = () => {
    if (!selectedServicio) return;
    const srv = servicios.find(s => s.IDServicio === parseInt(selectedServicio, 10));
    if (srv && !cartServicios.find(s => s.idservicio === srv.IDServicio)) {
      setCartServicios([...cartServicios, {
        idservicio: srv.IDServicio,
        nombre: srv.NombreServicio,
        precio: parseFloat(srv.Costo),
        cantidad: 1
      }]);
    }
  };

  const removePaquete = (id) => setCartPaquetes(cartPaquetes.filter(p => p.idpaquete !== id));
  const removeServicio = (id) => setCartServicios(cartServicios.filter(s => s.idservicio !== id));

  const changeQtyPaquete = (id, delta) => {
    setCartPaquetes(cartPaquetes.map(p => {
      if (p.idpaquete === id) return { ...p, cantidad: Math.max(1, p.cantidad + delta) };
      return p;
    }));
  };

  const changeQtyServicio = (id, delta) => {
    setCartServicios(cartServicios.map(s => {
      if (s.idservicio === id) return { ...s, cantidad: Math.max(1, s.cantidad + delta) };
      return s;
    }));
  };

  const calculateTotal = () => {
    const totalPaquetes = cartPaquetes.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    const totalServicios = cartServicios.reduce((acc, s) => acc + (s.precio * s.cantidad), 0);
    return totalPaquetes + totalServicios;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartPaquetes.length === 0 && cartServicios.length === 0) {
      showToast('Debes seleccionar al menos un paquete o servicio', 'error');
      return;
    }

    try {
      const subTotal = calculateTotal();
      const payload = { 
        ...formData, 
        FechaReserva: formData.FechaReserva || new Date().toISOString().slice(0, 19).replace('T', ' '),
        SubTotal: subTotal,
        Descuento: 0,
        IVA: 0,
        MontoTotal: subTotal,
        UsuarioIdusuario: 1, 
        detallesPaquetes: cartPaquetes,
        detallesServicios: cartServicios
      };
      
      if (isEditingFull && selectedReservaToUpdate) {
        const rId = selectedReservaToUpdate.IdReserva || selectedReservaToUpdate.IDReserva || selectedReservaToUpdate.id;
        await api.put(`/reservas/${rId}`, payload);
        showToast('Reserva actualizada exitosamente', 'success');
      } else {
        await api.post('/reservas', payload);
        showToast('Reserva generada exitosamente, maestro y detalle sincronizados', 'success');
      }
      setIsModalOpen(false);
      fetchTodos();
    } catch (error) {
      showToast(error.message || 'Error guardando reserva', 'error');
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm('¿Eliminar esta reserva y liberar los recursos?')) {
      try {
        await api.delete(`/reservas/${row.IdReserva || row.IDReserva || row.id}`);
        showToast('Reserva anulada permanentemente', 'success');
        fetchTodos();
      } catch (error) {
        showToast('No se puede eliminar. Verifica que no tenga facturas vinculadas.', 'error');
      }
    }
  };

  const handleViewDetail = async (row) => {
    setDetailLoading(true);
    setDetailData({ reserva: row, paquetes: [], servicios: [] });
    setIsDetailModalOpen(true);
    try {
      const rId = row.IdReserva || row.IDReserva || row.id;
      const [paqData, srvData] = await Promise.all([
        api.get(`/reservas/${rId}/paquetes`),
        api.get(`/reservas/${rId}/servicios`)
      ]);
      setDetailData({ reserva: row, paquetes: Array.isArray(paqData) ? paqData : [], servicios: Array.isArray(srvData) ? srvData : [] });
    } catch {
      showToast('Error cargando detalles', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEdit = async (row) => {
    setSelectedReservaToUpdate(row);
    setIsEditingFull(true);
    
    // Set basic data
    setFormData({
      NroDocumentoCliente: row.NroDocumentoCliente,
      FechaInicio: row.FechaInicio ? row.FechaInicio.slice(0, 10) : '',
      FechaFinalizacion: row.FechaFinalizacion ? row.FechaFinalizacion.slice(0, 10) : '',
      IdEstadoReserva: row.IdEstadoReserva,
      MetodoPago: row.MetodoPago,
      FechaReserva: row.FechaReserva
    });

    try {
      const rId = row.IdReserva || row.IDReserva || row.id;
      // Fetch details
      const [paqData, srvData] = await Promise.all([
        api.get(`/reservas/${rId}/paquetes`),
        api.get(`/reservas/${rId}/servicios`)
      ]);

      setCartPaquetes(paqData.map(p => ({
        idpaquete: p.IDPaquete,
        nombre: p.NombrePaquete,
        precio: parseFloat(p.Precio),
        cantidad: p.Cantidad
      })));

      setCartServicios(srvData.map(s => ({
        idservicio: s.IDServicio,
        nombre: s.NombreServicio,
        precio: parseFloat(s.Precio),
        cantidad: s.Cantidad
      })));

      setIsModalOpen(true);
    } catch (error) {
      showToast('Error cargando detalles de la reserva', 'error');
    }
  };

  const columns = [
    { label: '# Reserva', key: 'IdReserva', render: (val, row) => `RSV-${val || row.IDReserva || row.id}` },
    { label: 'Cliente', key: 'NroDocumentoCliente' },
    { label: 'Ingreso', key: 'FechaInicio', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
    { label: 'Salida', key: 'FechaFinalizacion', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
    { label: 'Total', key: 'MontoTotal', render: (val) => <strong style={{color: 'var(--color-primary)'}}>${parseFloat(val || 0).toLocaleString()}</strong> },
    { label: 'Estado', key: 'NombreEstadoReserva', render: (val) => {
        let color = 'var(--color-text-muted)';
        if (val === 'Completada' || val === 'Finalizada') color = 'var(--color-success)';
        if (val === 'Pendiente') color = 'var(--color-warning)';
        if (val === 'Rechazada' || val === 'Anulada') color = 'var(--color-danger)';
        return <span style={{ color, fontWeight: 'bold' }}>{val || 'Pendiente'}</span>;
    }},
  ];

  return (
    <div className="reservas-page animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Gestión de Reservas</h2>
        <Button icon={<CalendarCheck size={18} />} onClick={openModal}>Crear Motor de Reserva</Button>
      </div>

      <Card title="Portal de Agendamiento" noPadding>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>Cargando información del hotel...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={reservas} 
            onView={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>

      {/* ── DETAIL VIEW MODAL ── */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Detalle Reserva RSV-${detailData.reserva?.IdReserva || ''}`} size="lg">
        {detailLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando detalles...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[['# Reserva', `RSV-${detailData.reserva?.IdReserva}`], ['Cliente', detailData.reserva?.NroDocumentoCliente], ['Fecha Ingreso', detailData.reserva?.FechaInicio ? new Date(detailData.reserva.FechaInicio).toLocaleDateString() : 'N/A'], ['Fecha Salida', detailData.reserva?.FechaFinalizacion ? new Date(detailData.reserva.FechaFinalizacion).toLocaleDateString() : 'N/A'], ['Método de Pago', detailData.reserva?.NomMetodoPago || 'N/A'], ['Estado', detailData.reserva?.NombreEstadoReserva || 'Pendiente']].map(([label, val]) => (
                <div key={label} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Paquetes */}
            <div>
              <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>Paquetes Contratados</h4>
              {detailData.paquetes.length === 0 ? <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Sin paquetes</p> : detailData.paquetes.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(59,130,246,0.07)', borderLeft: '3px solid var(--color-primary)', borderRadius: '6px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{p.NombrePaquete}</span>
                  <span>x{p.Cantidad} — <strong style={{ color: 'var(--color-primary)' }}>${parseFloat(p.Precio || 0).toLocaleString()}</strong></span>
                </div>
              ))}
            </div>

            {/* Servicios */}
            <div>
              <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>Servicios Contratados</h4>
              {detailData.servicios.length === 0 ? <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Sin servicios adicionales</p> : detailData.servicios.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(139,92,246,0.07)', borderLeft: '3px solid var(--color-secondary)', borderRadius: '6px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{s.NombreServicio}</span>
                  <span>x{s.Cantidad} — <strong style={{ color: 'var(--color-secondary)' }}>${parseFloat(s.Precio || 0).toLocaleString()}</strong></span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', borderTop: '2px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Total de la Reserva</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>${parseFloat(detailData.reserva?.MontoTotal || 0).toLocaleString()}</span>
            </div>

            {/* Action Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>Cerrar</Button>
              <Button onClick={() => { setIsDetailModalOpen(false); handleEdit(detailData.reserva); }} icon={<Edit2 size={16}/>}>Editar Reserva</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditingFull ? "Editar Reserva" : "Generador Profesional de Reserva"} size="xl">
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
            
            {/* LEFT COLUMN: DATOS GENERALES */}
            <div style={{ flex: '1 1 280px', minWidth: '280px', background: 'var(--color-bg-light)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', margin: 0 }}>Datos de la Estancia</h3>
              </div>
              
              <Input 
                label="Cliente Titular" 
                name="NroDocumentoCliente" 
                isSelect 
                options={clientes.map(c => ({ value: c.NroDocumento, label: `${c.Nombre} ${c.Apellido} (${c.NroDocumento})` }))}
                value={formData.NroDocumentoCliente} 
                onChange={handleChange} 
                required 
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input label="Ingreso" type="date" name="FechaInicio" value={formData.FechaInicio} onChange={handleChange} required />
                <Input label="Salida" type="date" name="FechaFinalizacion" value={formData.FechaFinalizacion} onChange={handleChange} required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Input label="Estado" name="IdEstadoReserva" isSelect options={estados.map(e => ({ value: e.IdEstadoReserva, label: e.NombreEstadoReserva }))} value={formData.IdEstadoReserva} onChange={handleChange} required />
                <Input label="Pago" name="MetodoPago" isSelect options={metodos.map(m => ({ value: m.IdMetodoPago, label: m.NomMetodoPago }))} value={formData.MetodoPago} onChange={handleChange} required />
              </div>
            </div>

            {/* RIGHT COLUMN: CARRITO Y DETALLES */}
            <div style={{ flex: '2 1 400px', minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                 <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', margin: 0 }}>Paquetes & Servicios Adicionales</h3>
              </div>
              
              {/* Controles de Agregado Rápidos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Input 
                    label="Catálogo de Paquetes" 
                    name="tempPaquete" 
                    isSelect 
                    options={paquetes.filter(p => p.Estado).map(p => ({ value: p.IDPaquete, label: p.NombrePaquete }))}
                    value={selectedPaquete} 
                    onChange={(e) => setSelectedPaquete(e.target.value)} 
                    style={{ marginBottom: 0 }}
                  />
                  <Button variant="secondary" onClick={addPaquete} icon={<Plus size={16}/>} type="button" style={{ width: '100%' }}>Añadir Paquete</Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Input 
                    label="Servicios Extra" 
                    name="tempServicio" 
                    isSelect 
                    options={servicios.filter(s => s.Estado).map(s => ({ value: s.IDServicio, label: s.NombreServicio }))}
                    value={selectedServicio} 
                    onChange={(e) => setSelectedServicio(e.target.value)} 
                    style={{ marginBottom: 0 }}
                  />
                  <Button variant="secondary" onClick={addServicio} icon={<Plus size={16}/>} type="button" style={{ width: '100%' }}>Añadir Servicio</Button>
                </div>
              </div>

              {/* Lista Visual del Carrito */}
              <div style={{ minHeight: '180px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                {cartPaquetes.length === 0 && cartServicios.length === 0 && (
                  <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                     El carrito de estancia está vacío.
                  </div>
                )}
                
                {cartPaquetes.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent)', borderLeft: '3px solid var(--color-primary)', padding: '12px 16px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-primary)' }}>{p.nombre}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.95rem', color: 'var(--color-text-main)', marginRight: '8px', fontWeight: 500 }}>
                        ${p.precio.toLocaleString()}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2px' }}>
                         <button type="button" onClick={() => changeQtyPaquete(p.idpaquete, -1)} style={{ background: 'none', border: 'none', color: 'white', width: '28px', height: '28px', cursor: 'pointer', borderRadius: '50%' }}>-</button>
                         <span style={{ width: '24px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>{p.cantidad}</span>
                         <button type="button" onClick={() => changeQtyPaquete(p.idpaquete, 1)} style={{ background: 'none', border: 'none', color: 'white', width: '28px', height: '28px', cursor: 'pointer', borderRadius: '50%' }}>+</button>
                      </div>
                      <button type="button" onClick={() => removePaquete(p.idpaquete)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}

                {cartServicios.map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent)', borderLeft: '3px solid var(--color-secondary)', padding: '12px 16px', borderRadius: '4px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-secondary)' }}>{s.nombre}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.95rem', color: 'var(--color-text-main)', marginRight: '8px', fontWeight: 500 }}>
                        ${s.precio.toLocaleString()}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2px' }}>
                         <button type="button" onClick={() => changeQtyServicio(s.idservicio, -1)} style={{ background: 'none', border: 'none', color: 'white', width: '28px', height: '28px', cursor: 'pointer', borderRadius: '50%' }}>-</button>
                         <span style={{ width: '24px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>{s.cantidad}</span>
                         <button type="button" onClick={() => changeQtyServicio(s.idservicio, 1)} style={{ background: 'none', border: 'none', color: 'white', width: '28px', height: '28px', cursor: 'pointer', borderRadius: '50%' }}>+</button>
                      </div>
                      <button type="button" onClick={() => removeServicio(s.idservicio)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary and Submit */}
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Total Calculado:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    ${calculateTotal().toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancelar</Button>
                  <Button variant="primary" type="submit" style={{ flex: 2 }} icon={<CalendarCheck size={18} />}>
                    {isEditingFull ? "Guardar Cambios" : "Confirmar Reserva"}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reservas;
