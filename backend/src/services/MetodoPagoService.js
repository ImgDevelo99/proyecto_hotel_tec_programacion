const MetodoPago = require('../models/MetodoPago');

const listMetodos = async () => await MetodoPago.getAll();
const getMetodo = async (id) => await MetodoPago.getById(id);
const addMetodo = async (data) => await MetodoPago.create(data);
const updateMetodo = async (id, data) => await MetodoPago.update(id, data);
const deleteMetodo = async (id) => await MetodoPago.delete(id);

module.exports = { listMetodos, getMetodo, addMetodo, updateMetodo, deleteMetodo };
