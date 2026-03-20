import React, { useEffect, useState } from 'react';
import Card from '../components/Card/Card';
import DataTable from '../components/DataTable/DataTable';
import Button from '../components/Button/Button';
import { PackageOpen, Coffee, ShieldCheck, CreditCard, Activity } from 'lucide-react';
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
            <Button size="sm">Añadir</Button>
          </div>
          <Card noPadding>
            {loading ? <div style={{ padding: '24px' }}>Cargando...</div> : <DataTable columns={paqColumns} data={paquetes} />}
          </Card>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0 }}>
              <Coffee color="var(--color-secondary)" /> Servicios
            </h3>
            <Button size="sm" variant="secondary">Añadir</Button>
          </div>
          <Card noPadding>
            {loading ? <div style={{ padding: '24px' }}>Cargando...</div> : <DataTable columns={servColumns} data={servicios} />}
          </Card>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px' }}>
            <ShieldCheck size={20} color="var(--color-accent)" /> Roles del Sistema
          </h3>
          <Card noPadding>
            {loading ? <div style={{ padding: '24px' }}>Cargando...</div> : <DataTable columns={rolColumns} data={roles} />}
          </Card>
        </div>
        
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px' }}>
            <CreditCard size={20} color="var(--color-warning)" /> Métodos de Pago
          </h3>
          <Card noPadding>
            {loading ? <div style={{ padding: '24px' }}>Cargando...</div> : <DataTable columns={metColumns} data={metodos} />}
          </Card>
        </div>

        <div>
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px' }}>
            <Activity size={20} color="var(--color-danger)" /> Estados de Reserva
          </h3>
          <Card noPadding>
            {loading ? <div style={{ padding: '24px' }}>Cargando...</div> : <DataTable columns={extColumns} data={estados} />}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
