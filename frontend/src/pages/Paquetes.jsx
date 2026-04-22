import React, { useEffect, useState } from 'react';
import Card from '../components/Card/Card';
import DataTable from '../components/DataTable/DataTable';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import Input from '../components/Input/Input';
import { PackageOpen } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const Paquetes = () => {
  const [paquetes, setPaquetes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    NombrePaquete: '',
    Descripcion: '',
    IDHabitacion: '',
    IDServicio: '',
    Precio: '',
    Estado: '1'
  });

  const fetchData = async () => {
    try {
      const [paqData, habData, servData] = await Promise.all([
        api.get('/paquetes'),
        api.get('/habitaciones'),
        api.get('/servicios')
      ]);
      setPaquetes(paqData);
      setHabitaciones(habData);
      setServicios(servData);
    } catch (error) {
      showToast('Error cargando datos de paquetes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (paq = null) => {
    if (paq) {
      setEditingId(paq.IDPaquete || paq.id);
      setFormData({
        NombrePaquete: paq.NombrePaquete,
        Descripcion: paq.Descripcion,
        IDHabitacion: paq.IDHabitacion || '',
        IDServicio: paq.IDServicio || '',
        Precio: paq.Precio,
        Estado: paq.Estado ? '1' : '0'
      });
    } else {
      setEditingId(null);
      setFormData({ 
        NombrePaquete: '', 
        Descripcion: '', 
        IDHabitacion: '', 
        IDServicio: '', 
        Precio: '', 
        Estado: '1' 
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        IDHabitacion: formData.IDHabitacion ? parseInt(formData.IDHabitacion, 10) : null,
        IDServicio: formData.IDServicio ? parseInt(formData.IDServicio, 10) : null,
        Precio: parseFloat(formData.Precio),
        Estado: formData.Estado === '1'
      };

      if (editingId) {
        await api.put(`/paquetes/${editingId}`, payload);
        showToast('Paquete actualizado exitosamente');
      } else {
        await api.post('/paquetes', payload);
        showToast('Paquete creado exitosamente');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm('¿Seguro que deseas eliminar este paquete promocional?')) {
      try {
        await api.delete(`/paquetes/${row.IDPaquete || row.id}`);
        showToast('Paquete eliminado', 'success');
        fetchData();
      } catch (error) {
        showToast('No se puede borrar, el paquete podría estar en uso.', 'error');
      }
    }
  };

  const columns = [
    { label: 'Paquete', key: 'NombrePaquete' },
    { label: 'Descripción', key: 'Descripcion' },
    { label: 'Precio', key: 'Precio', render: (val) => `$${parseFloat(val || 0).toLocaleString()}` },
    { 
      label: 'Estado', 
      key: 'Estado', 
      render: (val) => (
        <span style={{
          padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem',
          background: val ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: val ? 'var(--color-accent)' : 'var(--color-danger)'
        }}>
          {val ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ];

  return (
    <div className="paquetes-page animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Paquetes Promocionales</h2>
        <Button icon={<PackageOpen size={18} />} onClick={() => openModal()}>Nuevo Paquete</Button>
      </div>

      <Card title="Gestionar Paquetes del Hotel" noPadding>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando paquetes...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={paquetes} 
            onEdit={openModal}
            onDelete={handleDelete}
          />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Paquete' : 'Crear Paquete'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <Input label="Nombre del Paquete" name="NombrePaquete" value={formData.NombrePaquete} onChange={handleChange} required />
            <Input label="Estado" name="Estado" isSelect options={[ { value: '1', label: 'Disponible' }, { value: '0', label: 'No Disponible' } ]} value={formData.Estado} onChange={handleChange} required />
          </div>
          
          <Input label="Descripción Corta" name="Descripcion" value={formData.Descripcion} onChange={handleChange} required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <Input 
               label="Habitación (Opcional)" 
               name="IDHabitacion" 
               isSelect 
               options={habitaciones.map(h => ({ value: h.IDHabitacion, label: h.NombreHabitacion }))}
               value={formData.IDHabitacion} 
               onChange={handleChange} 
               placeholder="Ninguna"
             />
             <Input 
               label="Servicio (Opcional)" 
               name="IDServicio" 
               isSelect 
               options={servicios.map(s => ({ value: s.IDServicio, label: s.NombreServicio }))}
               value={formData.IDServicio} 
               onChange={handleChange} 
               placeholder="Ninguno"
             />
          </div>
          
          <Input label="Precio Total ($)" type="number" name="Precio" value={formData.Precio} onChange={handleChange} required />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar Cambios' : 'Crear Paquete'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Paquetes;
