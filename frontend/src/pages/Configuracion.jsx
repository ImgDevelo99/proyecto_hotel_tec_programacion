import React, { useEffect, useState } from 'react';
import Card from '../components/Card/Card';
import DataTable from '../components/DataTable/DataTable';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import Input from '../components/Input/Input';
import { PackageOpen, Coffee, ShieldCheck, CreditCard, Activity, Plus } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const Configuracion = () => {
  const [paquetes, setPaquetes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Modals state
  const [modalType, setModalType] = useState(null); // 'metodo', 'estado'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  const fetchData = async () => {
    try {
      const [paqData, servData, rolesData, mtData, estData] = await Promise.all([
        api.get('/paquetes'),
        api.get('/servicios'),
        api.get('/roles'),
        api.get('/metodos-pago'),
        api.get('/estados-reserva')
      ]);
      setPaquetes(paqData);
      setServicios(servData);
      setRoles(rolesData);
      setMetodos(mtData);
      setEstados(estData);
    } catch (error) {
      showToast('Error cargando catálogos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setEditingId(item.IdMetodoPago || item.IdEstadoReserva);
      setFormData({ name: item.NomMetodoPago || item.NombreEstadoReserva });
    } else {
      setEditingId(null);
      setFormData({ name: '' });
    }
  };

  const closeModal = () => setModalType(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'metodo') {
        const payload = { NomMetodoPago: formData.name };
        if (editingId) await api.put(`/metodos-pago/${editingId}`, payload);
        else await api.post('/metodos-pago', payload);
      } else if (modalType === 'estado') {
        const payload = { NombreEstadoReserva: formData.name };
        if (editingId) await api.put(`/estados-reserva/${editingId}`, payload);
        else await api.post('/estados-reserva', payload);
      }
      showToast(`${modalType === 'metodo' ? 'Método' : 'Estado'} guardado exitosamente`);
      closeModal();
      fetchData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const paqColumns = [
    { label: 'Paquete', key: 'NombrePaquete' },
    { label: 'Precio', key: 'Precio', render: (val) => `$${parseFloat(val || 0).toLocaleString()}` },
    { label: 'Estado', key: 'Estado', render: (v) => v ? 'Activo' : 'Inactivo' },
  ];

  const servColumns = [
    { label: 'Servicio', key: 'NombreServicio' },
    { label: 'Costo', key: 'Costo', render: (val) => `$${parseFloat(val || 0).toLocaleString()}` },
    { label: 'Dura.', key: 'Duracion' },
  ];

  const rolColumns = [
    { label: 'Rol', key: 'Nombre' },
    { label: 'IsActive', key: 'IsActive', render: (v) => v ? 'Sí' : 'No' },
  ];

  const metColumns = [
    { label: 'Método', key: 'NomMetodoPago' },
  ];

  const extColumns = [
    { label: 'Estado Reserva', key: 'NombreEstadoReserva' },
  ];

  return (
    <div className="configuracion-page animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Configuración y Catálogos</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0 }}>
              <PackageOpen color="var(--color-primary)" /> Paquetes
            </h3>
            {/* Managed in Paquetes page */}
          </div>
          <Card noPadding>
            {loading ? <div style={{ padding: '24px' }}>Cargando...</div> : <DataTable columns={paqColumns} data={paquetes.slice(0, 4)} />}
          </Card>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0 }}>
              <Coffee color="var(--color-secondary)" /> Servicios
            </h3>
            {/* Managed in Servicios page */}
          </div>
          <Card noPadding>
            {loading ? <div style={{ padding: '24px' }}>Cargando...</div> : <DataTable columns={servColumns} data={servicios.slice(0, 4)} />}
          </Card>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', margin: 0 }}>
              <ShieldCheck size={20} color="var(--color-accent)" /> Roles del Sistema
            </h3>
          </div>
          <Card noPadding>
            {loading ? <div style={{ padding: '24px' }}>Cargando...</div> : <DataTable columns={rolColumns} data={roles} />}
          </Card>
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', margin: 0 }}>
              <CreditCard size={20} color="var(--color-warning)" /> Métodos de Pago
            </h3>
            <Button size="sm" icon={<Plus size={14}/>} onClick={() => openModal('metodo')}>Añadir</Button>
          </div>
          <Card noPadding>
            {loading ? <div style={{ padding: '24px' }}>Cargando...</div> : <DataTable columns={metColumns} data={metodos} onEdit={(r) => openModal('metodo', r)} />}
          </Card>
        </div>

        <div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', margin: 0 }}>
              <Activity size={20} color="var(--color-danger)" /> Estados de Reserva
            </h3>
            <Button size="sm" icon={<Plus size={14}/>} onClick={() => openModal('estado')}>Añadir</Button>
          </div>
          <Card noPadding>
            {loading ? <div style={{ padding: '24px' }}>Cargando...</div> : <DataTable columns={extColumns} data={estados} onEdit={(r) => openModal('estado', r)} />}
          </Card>
        </div>
      </div>

      {modalType && (
        <Modal isOpen={!!modalType} onClose={closeModal} title={editingId ? `Editar ${modalType === 'metodo' ? 'Método' : 'Estado'}` : `Nuevo ${modalType === 'metodo' ? 'Método de Pago' : 'Estado de Reserva'}`}>
          <form onSubmit={handleSubmit}>
            <Input 
              label="Nombre" 
              name="name" 
              value={formData.name} 
              onChange={(e) => setFormData({ name: e.target.value })} 
              required 
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Configuracion;
