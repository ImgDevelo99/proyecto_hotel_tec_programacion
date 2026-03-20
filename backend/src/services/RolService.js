const Rol = require('../models/Rol');

const listRoles = async () => await Rol.getAll();
const getRol = async (id) => await Rol.getById(id);
const addRol = async (data) => await Rol.create(data);
const updateRol = async (id, data) => await Rol.update(id, data);
const deleteRol = async (id) => await Rol.delete(id);

module.exports = { listRoles, getRol, addRol, updateRol, deleteRol };
