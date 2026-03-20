const EstadoReserva = require('../models/EstadoReserva');

const listEstados = async () => await EstadoReserva.getAll();
const getEstado = async (id) => await EstadoReserva.getById(id);
const addEstado = async (data) => await EstadoReserva.create(data);
const updateEstado = async (id, data) => await EstadoReserva.update(id, data);
const deleteEstado = async (id) => await EstadoReserva.delete(id);

module.exports = { listEstados, getEstado, addEstado, updateEstado, deleteEstado };
