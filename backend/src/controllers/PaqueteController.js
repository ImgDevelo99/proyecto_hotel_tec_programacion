const PaqueteService = require('../services/PaqueteService');

const getAll = async (req, res, next) => {
  try { res.json(await PaqueteService.listPaquetes()); }
  catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const item = await PaqueteService.getPaquete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Paquete no encontrado' });
    res.json(item);
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const id = await PaqueteService.addPaquete(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const id = await PaqueteService.updatePaquete(req.params.id, req.body);
    if (!id) return res.status(404).json({ message: 'Paquete no encontrado' });
    res.json({ id, ...req.body });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const id = await PaqueteService.deletePaquete(req.params.id);
    if (!id) return res.status(404).json({ message: 'Paquete no encontrado' });
    res.json({ id });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
