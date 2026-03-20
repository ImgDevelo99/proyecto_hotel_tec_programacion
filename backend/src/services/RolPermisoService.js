const RolPermiso = require('../models/RolPermiso');

const listRolesPermisos = async () => await RolPermiso.getAll();
const getRolPermiso = async (id) => await RolPermiso.getById(id);
const addRolPermiso = async (data) => await RolPermiso.create(data);
const updateRolPermiso = async (id, data) => await RolPermiso.update(id, data);
const deleteRolPermiso = async (id) => await RolPermiso.delete(id);

module.exports = { listRolesPermisos, getRolPermiso, addRolPermiso, updateRolPermiso, deleteRolPermiso };
