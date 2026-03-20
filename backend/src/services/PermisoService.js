const Permiso = require('../models/Permiso');

const listPermisos = async () => await Permiso.getAll();
const getPermiso = async (id) => await Permiso.getById(id);
const addPermiso = async (data) => await Permiso.create(data);
const updatePermiso = async (id, data) => await Permiso.update(id, data);
const deletePermiso = async (id) => await Permiso.delete(id);

module.exports = { listPermisos, getPermiso, addPermiso, updatePermiso, deletePermiso };
