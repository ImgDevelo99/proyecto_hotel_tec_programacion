const ReservaService = require('../services/ReservaService');

const getAll = async (req, res, next) => {
  try { res.json(await ReservaService.listReservas()); }
  catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const item = await ReservaService.getReserva(req.params.id);
    if (!item) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json(item);
  } catch (error) { next(error); }
};

const getPaquetes = async (req, res, next) => {
  try {
    const Reserva = require('../models/Reserva');
    res.json(await Reserva.getPaquetesByReserva(req.params.id));
  } catch (error) { next(error); }
};

const getServicios = async (req, res, next) => {
  try {
    const Reserva = require('../models/Reserva');
    res.json(await Reserva.getServiciosByReserva(req.params.id));
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const id = await ReservaService.addReserva(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const id = await ReservaService.updateReserva(req.params.id, req.body);
    if (!id) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json({ id, ...req.body });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const id = await ReservaService.deleteReserva(req.params.id);
    if (!id) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json({ id });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, getPaquetes, getServicios, create, update, remove };
