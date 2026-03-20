const Paquete = require('../models/Paquete');

const listPaquetes = async () => await Paquete.getAll();
const getPaquete = async (id) => await Paquete.getById(id);
const addPaquete = async (data) => await Paquete.create(data);
const updatePaquete = async (id, data) => await Paquete.update(id, data);
const deletePaquete = async (id) => await Paquete.delete(id);

module.exports = { listPaquetes, getPaquete, addPaquete, updatePaquete, deletePaquete };
