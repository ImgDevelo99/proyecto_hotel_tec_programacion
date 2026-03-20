const ClienteService = require('../services/ClienteService');

const getAll = async (req, res, next) => {
  try {
    const clientes = await ClienteService.listClientes();
    res.json(clientes);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const cliente = await ClienteService.getCliente(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const result = await ClienteService.addCliente(req.body);
    res.status(201).json({ ...result, ...req.body });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const id = await ClienteService.updateCliente(req.params.id, req.body);
    if (!id) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json({ id, ...req.body });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = await ClienteService.deleteCliente(req.params.id);
    if (!id) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.status(200).json({ id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
