const Cliente = require('../models/Cliente');

const listClientes = async () => {
  return await Cliente.getAll();
};

const getCliente = async (id) => {
  return await Cliente.getById(id);
};

const addCliente = async (data) => {
  return await Cliente.create(data);
};

const updateCliente = async (id, data) => {
  return await Cliente.update(id, data);
};

const deleteCliente = async (id) => {
  return await Cliente.delete(id);
};

module.exports = {
  listClientes,
  getCliente,
  addCliente,
  updateCliente,
  deleteCliente
};
