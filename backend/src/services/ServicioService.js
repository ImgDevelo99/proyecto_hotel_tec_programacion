const Servicio = require('../models/Servicio');

const listServicios = async () => await Servicio.getAll();
const getServicio = async (id) => await Servicio.getById(id);
const addServicio = async (data) => await Servicio.create(data);
const updateServicio = async (id, data) => await Servicio.update(id, data);
const deleteServicio = async (id) => await Servicio.delete(id);

module.exports = { listServicios, getServicio, addServicio, updateServicio, deleteServicio };
