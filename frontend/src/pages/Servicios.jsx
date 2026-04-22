import React, { useEffect, useState } from 'react';
import Card from '../components/Card/Card';
import DataTable from '../components/DataTable/DataTable';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import Input from '../components/Input/Input';
import { Plus } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    NombreServicio: '',
    Descripcion: '',
    Duracion: '',
    CantidadMaximaPersonas: '',
    Costo: '',
    Estado: '1'
  });

  const fetchData = async () => {
    try {
      const data = await api.get('/servicios');
      setServicios(data);
    } catch (error) {
      showToast('Error cargando servicios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (srv = null) => {
    if (srv) {
      setEditingId(srv.IDServicio || srv.id);
      setFormData({
        NombreServicio: srv.NombreServicio,
        Descripcion: srv.Descripcion,
        Duracion: srv.Duracion,
        CantidadMaximaPersonas: srv.CantidadMaximaPersonas,
        Costo: srv.Costo,
        Estado: srv.Estado ? '1' : '0'
      });
    } else {
      setEditingId(null);
      setFormData({ NombreServicio: '', Descripcion: '', Duracion: '', CantidadMaximaPersonas: '', Costo: '', Estado: '1' });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        Costo: parseFloat(formData.Costo),
        CantidadMaximaPersonas: parseInt(formData.CantidadMaximaPersonas, 10),
        Estado: formData.Estado === '1'
      };

      if (editingId) {
        await api.put(`/servicios/${editingId}`, payload);
        showToast('Servicio actualizado');
      } else {
        await api.post('/servicios', payload);
        showToast('Servicio registrado');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm('¿Seguro que deseas eliminar este servicio maestro?')) {
      try {
        await api.delete(`/servicios/${row.IDServicio || row.id}`);
        showToast('Servicio borrado permanentemente', 'success');
        fetchData();
      } catch (error) {
        showToast('No se puede borrar, el servicio está en uso.', 'error');
      }
    }
  };

  const columns = [
    { label: 'Servicio', key: 'NombreServicio' },
    { label: 'Duración', key: 'Duracion' },
    { label: 'Max. Pax', key: 'CantidadMaximaPersonas', render: (val) => `${val || 0} p.` },
    { label: 'Costo', key: 'Costo', render: (val) => `$${parseFloat(val || 0).toLocaleString()}` },
    { 
      label: 'Estado', 
      key: 'Estado', 
      render: (val) => (
        <span style={{ color: val ? 'var(--color-accent)' : 'var(--color-danger)' }}>
          {val ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ];

  return (
    <div className="servicios-page animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Catálogo de Servicios</h2>
        <Button icon={<Plus size={18} />} onClick={() => openModal()}>Añadir Nuevo Servicio</Button>
      </div>

      <Card title="Gama de Servicios del Hotel" noPadding>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>Cargando...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={servicios} 
            onEdit={openModal}
            onDelete={handleDelete}
          />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Modificar Servicio' : 'Nuevo Servicio'} size="lg">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Nombre del Servicio" name="NombreServicio" value={formData.NombreServicio} onChange={handleChange} required />
            <Input label="Estado" name="Estado" isSelect options={[ { value: '1', label: 'Disponible' }, { value: '0', label: 'No Disponible' } ]} value={formData.Estado} onChange={handleChange} required />
          </div>
          <Input label="Descripción Corta" name="Descripcion" value={formData.Descripcion} onChange={handleChange} required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
             <Input label="Costo ($)" type="number" name="Costo" value={formData.Costo} onChange={handleChange} required />
             <Input label="Duración (Ej. 2h)" name="Duracion" value={formData.Duracion} onChange={handleChange} required />
             <Input label="Límite Pax" type="number" name="CantidadMaximaPersonas" value={formData.CantidadMaximaPersonas} onChange={handleChange} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar Cambios' : 'Generar Servicio'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Servicios;
