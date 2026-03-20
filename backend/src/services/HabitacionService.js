const Habitacion = require('../models/Habitacion');

const listHabitaciones = async () => {
  return await Habitacion.getAll();
};

const getHabitacion = async (id) => {
  return await Habitacion.getById(id);
};

const addHabitacion = async (data) => {
  return await Habitacion.create(data);
};

const updateHabitacion = async (id, data) => {
  return await Habitacion.update(id, data);
};

const deleteHabitacion = async (id) => {
  return await Habitacion.delete(id);
};

module.exports = {
  listHabitaciones,
  getHabitacion,
  addHabitacion,
  updateHabitacion,
  deleteHabitacion
};
