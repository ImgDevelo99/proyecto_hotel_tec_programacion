const MetodoPagoService = require('../services/MetodoPagoService');

const getAll = async (req, res, next) => {
  try { res.json(await MetodoPagoService.listMetodos()); }
  catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const item = await MetodoPagoService.getMetodo(req.params.id);
    if (!item) return res.status(404).json({ message: 'Método de pago no encontrado' });
    res.json(item);
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const id = await MetodoPagoService.addMetodo(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const id = await MetodoPagoService.updateMetodo(req.params.id, req.body);
    if (!id) return res.status(404).json({ message: 'Método de pago no encontrado' });
    res.json({ id, ...req.body });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const id = await MetodoPagoService.deleteMetodo(req.params.id);
    if (!id) return res.status(404).json({ message: 'Método de pago no encontrado' });
    res.json({ id });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
