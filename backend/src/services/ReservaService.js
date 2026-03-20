const Reserva = require('../models/Reserva');

const listReservas = async () => await Reserva.getAll();
const getReserva = async (id) => await Reserva.getById(id);
const addReserva = async (data) => await Reserva.create(data);
const updateReserva = async (id, data) => await Reserva.update(id, data);
const deleteReserva = async (id) => await Reserva.delete(id);

module.exports = { listReservas, getReserva, addReserva, updateReserva, deleteReserva };
