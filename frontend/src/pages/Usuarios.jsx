import React, { useEffect, useState } from 'react';
import Card from '../components/Card/Card';
import DataTable from '../components/DataTable/DataTable';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import Input from '../components/Input/Input';
import { Plus, Trash2, Edit2, Users, Shield } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    NombreUsuario: '',
    Apellido: '',
    Email: '',
    Contrasena: '',
    TipoDocumento: 'CC',
    NumeroDocumento: '',
    Telefono: '',
    Pais: '',
    Direccion: '',
    IDRol: 2 // Cliente default
  });

  const fetchTodos = async () => {
    try {
      const [usrRes, rolRes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/roles')
      ]);
      setUsuarios(Array.isArray(usrRes) ? usrRes : []);
      setRoles(Array.isArray(rolRes) ? rolRes : []);
    } catch (error) {
      showToast('Error cargando datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const resetForm = () => {
    setFormData({
      NombreUsuario: '', Apellido: '', Email: '', Contrasena: '',
      TipoDocumento: 'CC', NumeroDocumento: '', Telefono: '', Pais: '', Direccion: '', IDRol: 2
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      NombreUsuario: row.NombreUsuario || '',
      Apellido: row.Apellido || '',
      Email: row.Email || '',
      Contrasena: '', // Leave blank unless they want to change it
      TipoDocumento: row.TipoDocumento || 'CC',
      NumeroDocumento: row.NumeroDocumento || '',
      Telefono: row.Telefono || '',
      Pais: row.Pais || '',
      Direccion: row.Direccion || '',
      IDRol: row.IDRol || 2
    });
    setEditingId(row.IDUsuario || row.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    const id = row.IDUsuario || row.id;
    if (!id) return;
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        showToast('Usuario eliminado', 'success');
        fetchTodos();
      } catch (error) {
        showToast('Error eliminando usuario. Puede tener dependencias.', 'error');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/usuarios/${editingId}`, formData);
        showToast('Usuario actualizado', 'success');
      } else {
        await api.post('/usuarios', formData);
        showToast('Usuario creado', 'success');
      }
      setIsModalOpen(false);
      fetchTodos();
    } catch (error) {
      showToast(error.message || 'Error guardando usuario', 'error');
    }
  };

  const columns = [
    { label: 'Nombre Completo', key: 'NombreUsuario', render: (_, row) => `${row.NombreUsuario} ${row.Apellido || ''}` },
    { label: 'Documento', key: 'NumeroDocumento', render: (_, row) => `${row.TipoDocumento || 'CC'} ${row.NumeroDocumento || ''}` },
    { label: 'Email', key: 'Email' },
    { label: 'Teléfono', key: 'Telefono' },
    { label: 'Rol', key: 'IDRol', render: (val) => {
        const rol = roles.find(r => r.IDRol === val);
        const name = rol ? rol.NombreRol : (val === 1 ? 'Administrador' : 'Cliente');
        const color = val === 1 ? 'var(--color-primary)' : 'var(--color-text-main)';
        return <span style={{ color, fontWeight: val===1?600:400 }}>{val === 1 && <Shield size={12} style={{marginRight: '4px'}}/>}{name}</span>;
    }}
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Gestión de Usuarios</h2>
        <Button icon={<Plus size={18} />} onClick={openCreateModal}>Nuevo Usuario</Button>
      </div>

      <Card title="Directorio de Usuarios" noPadding>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>Cargando usuarios...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={usuarios} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            hideActions={(row) => row.IDUsuario === 1 || row.Email === 'superadmin@hotelsys.com'} // Protect root admin
          />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'} size="lg">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Nombres" name="NombreUsuario" value={formData.NombreUsuario} onChange={e => setFormData({...formData, NombreUsuario: e.target.value})} required />
            <Input label="Apellidos" name="Apellido" value={formData.Apellido} onChange={e => setFormData({...formData, Apellido: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Tipo Documento" name="TipoDocumento" isSelect options={[{value:'CC',label:'Cédula (CC)'},{value:'TI',label:'T. Identidad'},{value:'CE',label:'Cédula Extranjería'},{value:'PAS',label:'Pasaporte'}]} value={formData.TipoDocumento} onChange={e => setFormData({...formData, TipoDocumento: e.target.value})} required />
            <Input label="Número Documento" name="NumeroDocumento" value={formData.NumeroDocumento} onChange={e => setFormData({...formData, NumeroDocumento: e.target.value})} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Email" type="email" name="Email" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} required />
            <Input label="Teléfono" name="Telefono" value={formData.Telefono} onChange={e => setFormData({...formData, Telefono: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="País" name="Pais" value={formData.Pais} onChange={e => setFormData({...formData, Pais: e.target.value})} />
            <Input label="Dirección" name="Direccion" value={formData.Direccion} onChange={e => setFormData({...formData, Direccion: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Rol en el Sistema" name="IDRol" isSelect options={roles.map(r => ({ value: r.IDRol, label: r.NombreRol }))} value={formData.IDRol} onChange={e => setFormData({...formData, IDRol: Number(e.target.value)})} required />
            <Input label={editingId ? "Contraseña (Dejar en blanco para no cambiar)" : "Contraseña"} type="password" name="Contrasena" value={formData.Contrasena} onChange={e => setFormData({...formData, Contrasena: e.target.value})} required={!editingId} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">{editingId ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Usuarios;
