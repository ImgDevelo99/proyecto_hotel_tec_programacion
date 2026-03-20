const DetalleReservaServicio = require('../models/DetalleReservaServicio');

const listDetalles = async () => await DetalleReservaServicio.getAll();
const getDetalle = async (id) => await DetalleReservaServicio.getById(id);
const addDetalle = async (data) => await DetalleReservaServicio.create(data);
const updateDetalle = async (id, data) => await DetalleReservaServicio.update(id, data);
const deleteDetalle = async (id) => await DetalleReservaServicio.delete(id);

module.exports = { listDetalles, getDetalle, addDetalle, updateDetalle, deleteDetalle };
