const DetalleReservaPaquete = require('../models/DetalleReservaPaquete');

const listDetalles = async () => await DetalleReservaPaquete.getAll();
const getDetalle = async (id) => await DetalleReservaPaquete.getById(id);
const addDetalle = async (data) => await DetalleReservaPaquete.create(data);
const updateDetalle = async (id, data) => await DetalleReservaPaquete.update(id, data);
const deleteDetalle = async (id) => await DetalleReservaPaquete.delete(id);

module.exports = { listDetalles, getDetalle, addDetalle, updateDetalle, deleteDetalle };
