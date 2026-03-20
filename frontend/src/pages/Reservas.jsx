import React, { useEffect, useState } from 'react';
import Card from '../components/Card/Card';
import DataTable from '../components/DataTable/DataTable';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import Input from '../components/Input/Input';
import { Plus } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    NroDocumentoCliente: '',
    FechaInicio: '',
    FechaFinalizacion: '',
    MontoTotal: '',
    MetodoPago: '1',
    IdEstadoReserva: '1',
    UsuarioIdusuario: '1'
  });

  const fetchReservas = async () => {
    try {
      const data = await api.get('/reservas');
      setReservas(data);
    } catch (error) {
      showToast('Error fetching reservas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simplificado para la demostración
      const payload = { 
        ...formData, 
        FechaReserva: new Date().toISOString().slice(0, 19).replace('T', ' '),
        SubTotal: parseFloat(formData.MontoTotal),
        Descuento: 0,
        IVA: 0,
        MontoTotal: parseFloat(formData.MontoTotal)
      };
      await api.post('/reservas', payload);
      showToast('Reserva creada exitosamente');
      setIsModalOpen(false);
      fetchReservas();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm('¿Eliminar esta reserva? Esto puede fallar si tiene detalles asociados.')) {
      try {
        await api.delete(`/reservas/${row.IDReserva || row.id}`);
        showToast('Reserva eliminada');
        fetchReservas();
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  };

  const columns = [
    { label: 'ID', key: 'IdReserva', render: (val, row) => val || row.IDReserva || row.id },
    { label: 'Cliente Doc', key: 'NroDocumentoCliente', render: (val) => val || 'N/A' },
    { label: 'Ingreso', key: 'FechaInicio', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
    { label: 'Salida', key: 'FechaFinalizacion', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
    { label: 'Total', key: 'MontoTotal', render: (val) => `$${parseFloat(val || 0).toLocaleString()}` },
  ];

  return (
    <div className="reservas-page animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Gestión de Reservas</h2>
        <Button icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>Crear Reserva</Button>
      </div>

      <Card noPadding>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando reservas...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={reservas} 
            onDelete={handleDelete}
          />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Reserva Rápida">
        <form onSubmit={handleSubmit}>
          <Input label="Documento del Cliente" name="NroDocumentoCliente" value={formData.NroDocumentoCliente} onChange={handleChange} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Fecha Ingreso" type="date" name="FechaInicio" value={formData.FechaInicio} onChange={handleChange} required />
            <Input label="Fecha Salida" type="date" name="FechaFinalizacion" value={formData.FechaFinalizacion} onChange={handleChange} required />
          </div>
          <Input label="Monto Total ($)" type="number" name="MontoTotal" value={formData.MontoTotal} onChange={handleChange} required />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Generar Reserva</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reservas;
