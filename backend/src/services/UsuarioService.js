const Usuario = require('../models/Usuario');

const listUsuarios = async () => await Usuario.getAll();
const getUsuario = async (id) => await Usuario.getById(id);
const addUsuario = async (data) => await Usuario.create(data);
const updateUsuario = async (id, data) => await Usuario.update(id, data);
const deleteUsuario = async (id) => await Usuario.delete(id);

module.exports = { listUsuarios, getUsuario, addUsuario, updateUsuario, deleteUsuario };
