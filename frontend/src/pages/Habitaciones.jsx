import React, { useEffect, useState } from 'react';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import Input from '../components/Input/Input';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const Habitaciones = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    NombreHabitacion: '',
    Descripcion: '',
    Costo: '',
    Estado: '1',
    ImagenHabitacion: ''
  });

  const fetchRooms = async () => {
    try {
      const data = await api.get('/habitaciones');
      setHabitaciones(data);
    } catch (error) {
      showToast('Error cargando habitaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openModal = (room = null) => {
    if (room) {
      setEditingId(room.IDHabitacion || room.id);
      setFormData({
        NombreHabitacion: room.NombreHabitacion,
        Descripcion: room.Descripcion,
        Costo: room.Costo,
        Estado: room.Estado ? '1' : '0',
        ImagenHabitacion: room.ImagenHabitacion || ''
      });
    } else {
      setEditingId(null);
      setFormData({ NombreHabitacion: '', Descripcion: '', Costo: '', Estado: '1', ImagenHabitacion: '' });
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
        Costo: parseFloat(formData.Costo),
        Estado: formData.Estado === '1'
      };

      if (editingId) {
        await api.put(`/habitaciones/${editingId}`, payload);
        showToast('Habitación actualizada exitosamente');
      } else {
        await api.post('/habitaciones', payload);
        showToast('Habitación creada exitosamente');
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta habitación?')) {
      try {
        await api.delete(`/habitaciones/${id}`);
        showToast('Habitación eliminada exitosamente');
        fetchRooms();
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  };

  return (
    <div className="habitaciones-page animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Gestión de Habitaciones</h2>
        <Button icon={<Plus size={18} />} onClick={() => openModal()}>Nueva Habitación</Button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Cargando habitaciones...</p>
      ) : habitaciones.length === 0 ? (
        <Card>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay habitaciones registradas.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {habitaciones.map((hab, i) => {
            const imgStr = typeof hab.ImagenHabitacion === 'string' ? hab.ImagenHabitacion : '';
            const hasImage = imgStr.startsWith('http');
            const bgStyle = hasImage 
              ? { backgroundImage: `url(${imgStr})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
              : { background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))' };

            return (
              <Card key={hab.IDHabitacion || hab.id || i} className={`animate-slide-up animate-delay-${(i % 5 + 1) * 100}`} noPadding>
                <div style={{ height: '160px', ...bgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!hasImage && <span style={{ fontSize: '3rem' }}>🛏️</span>}
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{hab.NombreHabitacion}</h3>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      background: hab.Estado ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: hab.Estado ? 'var(--color-accent)' : 'var(--color-danger)'
                    }}>
                      {hab.Estado ? 'Disponible' : 'Mantenimiento'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px', minHeight: '40px' }}>
                    {hab.Descripcion}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
                      ${parseFloat(hab.Costo).toLocaleString()}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="secondary" size="sm" icon={<Edit2 size={14} />} onClick={() => openModal(hab)} />
                      <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => handleDelete(hab.IDHabitacion || hab.id)} />
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Habitación' : 'Nueva Habitación'} size="md">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <Input label="Nombre de Habitación" name="NombreHabitacion" value={formData.NombreHabitacion} onChange={handleChange} required />
            <Input label="Estado" name="Estado" isSelect options={[ { value: '1', label: 'Disponible' }, { value: '0', label: 'En Mantenimiento' } ]} value={formData.Estado} onChange={handleChange} required />
          </div>
          
          <Input label="URL de la Foto (Opcional)" name="ImagenHabitacion" placeholder="https://ejemplo.com/foto.jpg" value={formData.ImagenHabitacion} onChange={handleChange} />
          
          <Input label="Descripción" name="Descripcion" value={formData.Descripcion} onChange={handleChange} required />
          <Input label="Costo por noche ($)" type="number" name="Costo" value={formData.Costo} onChange={handleChange} required />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingId ? 'Guardar Cambios' : 'Crear Habitación'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Habitaciones;
