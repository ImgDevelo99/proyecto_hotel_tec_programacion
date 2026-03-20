import React, { useEffect, useState } from 'react';
import Card from '../components/Card/Card';
import DataTable from '../components/DataTable/DataTable';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import Input from '../components/Input/Input';
import { UserPlus, Download } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const Usuarios = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    NroDocumento: '',
    Nombre: '',
    Apellido: '',
    Email: '',
    Telefono: '',
    Direccion: '',
    Estado: '1'
  });

  const fetchData = async () => {
    try {
      const cliData = await api.get('/clientes');
      setClientes(cliData);
    } catch (error) {
      showToast('Error cargando clientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (client = null) => {
    if (client) {
      setEditingId(client.NroDocumento); // En Clientes, NroDocumento es la llave en la URL
      setFormData({
        NroDocumento: client.NroDocumento,
        Nombre: client.Nombre,
        Apellido: client.Apellido,
        Email: client.Email,
        Telefono: client.Telefono,
        Direccion: client.Direccion,
        Estado: client.Estado ? '1' : '0'
      });
    } else {
      setEditingId(null);
      setFormData({ NroDocumento: '', Nombre: '', Apellido: '', Email: '', Telefono: '', Direccion: '', Estado: '1' });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        Estado: formData.Estado === '1'
      };

      if (editingId) {
        // En nuestro backend, el id es el identificador para actualizar
        const clientTarget = clientes.find(c => c.NroDocumento === editingId);
        const actualId = clientTarget.IDCliente || editingId;
        await api.put(`/clientes/${actualId}`, payload);
        showToast('Cliente actualizado exitosamente');
      } else {
        await api.post('/clientes', payload);
        showToast('Cliente creado exitosamente');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        const actualId = row.NroDocumento;
        await api.delete(`/clientes/${actualId}`);
        showToast('Cliente eliminado exitosamente');
        fetchData();
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  };

  const columns = [
    { label: 'Documento', key: 'NroDocumento' },
    { label: 'Nombre', key: 'Nombre', render: (val, row) => `${val} ${row.Apellido || ''}` },
    { label: 'Email', key: 'Email' },
    { label: 'Teléfono', key: 'Telefono' },
    { 
      label: 'Estado', 
      key: 'Estado', 
      render: (val) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          background: val ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: val ? 'var(--color-accent)' : 'var(--color-danger)'
        }}>
          {val ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ];

  return (
    <div className="usuarios-page animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Directorio de Clientes</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" icon={<Download size={18} />}>Exportar</Button>
          <Button icon={<UserPlus size={18} />} onClick={() => openModal()}>Registrar Cliente</Button>
        </div>
      </div>

      <Card title="Listado General" noPadding>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando clientes...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={clientes} 
            onEdit={openModal}
            onDelete={handleDelete}
          />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Nro Documento" name="NroDocumento" value={formData.NroDocumento} onChange={handleChange} required disabled={!!editingId} />
            <Input label="Estado" name="Estado" isSelect options={[ { value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' } ]} value={formData.Estado} onChange={handleChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Nombre" name="Nombre" value={formData.Nombre} onChange={handleChange} required />
            <Input label="Apellido" name="Apellido" value={formData.Apellido} onChange={handleChange} required />
          </div>
          <Input label="Email" type="email" name="Email" value={formData.Email} onChange={handleChange} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Teléfono" name="Telefono" value={formData.Telefono} onChange={handleChange} />
            <Input label="Dirección" name="Direccion" value={formData.Direccion} onChange={handleChange} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar Cambios' : 'Registrar Cliente'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Usuarios;
