import React, { useEffect, useState } from 'react';
import Card from '../components/Card/Card';
import DataTable from '../components/DataTable/DataTable';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import Input from '../components/Input/Input';
import { ShieldCheck, Plus, Settings2, Check, X } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

// Módulos del sistema que se pueden asignar como permisos
const SYSTEM_MODULES = [
  { path: '/habitaciones', label: '🛏️  Habitaciones', description: 'Ver y gestionar habitaciones' },
  { path: '/reservas',     label: '📅  Reservas',     description: 'Crear y gestionar reservas' },
  { path: '/clientes',     label: '👥  Clientes',     description: 'Administrar clientes' },
  { path: '/servicios',    label: '☕  Servicios',    description: 'Ver y crear servicios' },
  { path: '/paquetes',     label: '📦  Paquetes',     description: 'Gestionar paquetes' },
  { path: '/configuracion',label: '⚙️  Configuración',description: 'Acceso a catálogos' },
  { path: '/roles-permisos', label: '🛡️  Roles y Permisos', description: 'Gestionar accesos (solo admins)' },
];

const selectStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'white',
  padding: '12px 14px',
  borderRadius: '10px',
  outline: 'none',
  fontSize: '0.95rem',
};

const RolesPermisos = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Modal: Crear / Editar Rol
  const [isRolModalOpen, setIsRolModalOpen] = useState(false);
  const [rolForm, setRolForm] = useState({ id: null, name: '', estado: 'Activo' });

  // Modal: Asignar módulos al rol
  const [isPermisosModalOpen, setIsPermisosModalOpen] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);
  const [selectedModulos, setSelectedModulos] = useState([]);  // array of paths
  const [permisosBD, setPermisosBD] = useState([]);            // permisos en BD
  const [loadingPermisos, setLoadingPermisos] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const rData = await api.get('/roles');
      setRoles(rData);
    } catch {
      showToast('Error cargando roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Rol Handlers ──────────────────────────────────────
  const openRolModal = (item = null) => {
    setRolForm(item
      ? { id: item.IDRol, name: item.Nombre, estado: item.Estado || 'Activo' }
      : { id: null, name: '', estado: 'Activo' }
    );
    setIsRolModalOpen(true);
  };

  const handleSaveRol = async (e) => {
    e.preventDefault();
    try {
      const payload = { Nombre: rolForm.name, Estado: rolForm.estado };
      if (rolForm.id) {
        await api.put(`/roles/${rolForm.id}`, payload);
        showToast('Rol actualizado correctamente');
      } else {
        await api.post('/roles', payload);
        showToast('Rol creado exitosamente');
      }
      setIsRolModalOpen(false);
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteRol = async (rol) => {
    if (!window.confirm(`¿Eliminar el rol "${rol.Nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/roles/${rol.IDRol}`);
      showToast('Rol eliminado');
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ── Permisos (Módulos) Handlers ───────────────────────
  const openPermisosModal = async (rol) => {
    if (rol.IDRol === 1) {
      return showToast('El Super Administrador tiene acceso total y no requiere configuración.', 'info');
    }
    setSelectedRol(rol);
    setLoadingPermisos(true);
    setIsPermisosModalOpen(true);

    try {
      // 1. Traer todos los permisos de la BD
      const allPermisos = await api.get('/permisos');
      setPermisosBD(allPermisos);

      // 2. Traer los IDs de permisos actuales para este rol
      const currentIds = await api.get(`/roles-permisos/by-rol/${rol.IDRol}`);

      // 3. Identificar qué módulos del sistema ya están asignados
      // Mapeamos: para cada módulo del sistema, buscamos si en BD existe un permiso con ese NombrePermisos
      const currentPaths = allPermisos
        .filter(p => currentIds.includes(p.IDPermiso))
        .map(p => p.NombrePermisos);

      setSelectedModulos(currentPaths);
    } catch {
      showToast('Error cargando permisos del rol', 'error');
    } finally {
      setLoadingPermisos(false);
    }
  };

  const toggleModulo = (path) => {
    setSelectedModulos(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const handleSavePermisos = async () => {
    if (!selectedRol) return;
    try {
      // 1. Para cada módulo seleccionado, asegúrese de que exista una fila en permisos
      const permisoIds = [];
      for (const path of selectedModulos) {
        const modMeta = SYSTEM_MODULES.find(m => m.path === path);
        let existente = permisosBD.find(p => p.NombrePermisos === path);
        if (!existente) {
          // Crear el permiso si no existe
          const created = await api.post('/permisos', {
            NombrePermisos: path,
            Descripcion: modMeta?.description || path,
            EstadoPermisos: 'Activo',
          });
          existente = { IDPermiso: created.id };
        }
        permisoIds.push(existente.IDPermiso);
      }

      // 2. Sincronizar en bulk
      await api.put(`/roles-permisos/sync/${selectedRol.IDRol}`, { idPermisos: permisoIds });

      showToast(`Módulos actualizados para el rol "${selectedRol.Nombre}"`);
      setIsPermisosModalOpen(false);
    } catch (err) { showToast(err.message, 'error'); }
  };

  // ── Columnas ──────────────────────────────────────────
  const rolesCols = [
    { label: 'ID', key: 'IDRol', render: v => <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>#{v}</span> },
    { label: 'Rol', key: 'Nombre', render: v => <span style={{ fontWeight: '600' }}>{v}</span> },
    {
      label: 'Estado', key: 'Estado',
      render: v => (
        <span style={{
          padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500',
          background: v === 'Activo' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          color: v === 'Activo' ? '#34d399' : '#f87171',
        }}>{v || 'Activo'}</span>
      )
    },
    {
      label: 'Módulos Asignados', key: 'IDRol',
      render: (idRol, row) => idRol === 1
        ? <span style={{ color: '#facc15', fontSize: '0.85rem', fontWeight: '500' }}>⭐ Acceso Total</span>
        : (
          <button
            onClick={() => openPermisosModal(row)}
            style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: 'none', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Settings2 size={13} /> Configurar módulos
          </button>
        )
    },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <ShieldCheck color="var(--color-primary)" size={26} /> Gestión de Roles y Accesos
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Administra qué módulos puede ver cada rol dentro del sistema
          </p>
        </div>
        <Button onClick={() => openRolModal()} icon={<Plus size={16} />}>Nuevo Rol</Button>
      </div>

      {/* Tabla de Roles */}
      <Card>
        {loading ? (
          <p style={{ padding: '20px', color: 'var(--color-text-muted)' }}>Cargando roles...</p>
        ) : (
          <DataTable
            data={roles}
            columns={rolesCols}
            onEdit={(r) => openRolModal(r)}
            onDelete={handleDeleteRol}
            itemsPerPage={10}
            hideActions={(r) => r.IDRol === 1}
          />
        )}
      </Card>

      {/* ── Modal: Crear / Editar Rol ── */}
      <Modal isOpen={isRolModalOpen} onClose={() => setIsRolModalOpen(false)} title={rolForm.id ? 'Editar Rol' : 'Nuevo Rol'}>
        <form onSubmit={handleSaveRol}>
          <Input
            label="Nombre del Rol" required
            value={rolForm.name}
            onChange={e => setRolForm({ ...rolForm, name: e.target.value })}
            placeholder="Ej. Recepcionista"
          />
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Estado</label>
            <select style={selectStyle} value={rolForm.estado} onChange={e => setRolForm({ ...rolForm, estado: e.target.value })}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
            <Button variant="secondary" onClick={() => setIsRolModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Asignar Módulos al Rol ── */}
      <Modal
        isOpen={isPermisosModalOpen}
        onClose={() => setIsPermisosModalOpen(false)}
        title={`Módulos para: ${selectedRol?.Nombre || ''}`}
      >
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
          Selecciona los módulos del sistema a los que este rol tendrá acceso.
        </p>

        {loadingPermisos ? (
          <p style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>Cargando accesos actuales...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
            {SYSTEM_MODULES.map(mod => {
              const isChecked = selectedModulos.includes(mod.path);
              return (
                <div
                  key={mod.path}
                  onClick={() => toggleModulo(mod.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                    background: isChecked ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isChecked ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    transition: 'all 0.15s ease',
                    userSelect: 'none',
                  }}
                >
                  {/* Checkbox visual */}
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                    background: isChecked ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isChecked ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {isChecked && <Check size={14} color="white" strokeWidth={3} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{mod.label}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{mod.description}</p>
                  </div>

                  {isChecked
                    ? <span style={{ color: '#a5b4fc', fontSize: '0.75rem' }}>Habilitado</span>
                    : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Sin acceso</span>
                  }
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            {selectedModulos.length} de {SYSTEM_MODULES.length} módulos seleccionados
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={() => setIsPermisosModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePermisos}>Guardar Accesos</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RolesPermisos;
