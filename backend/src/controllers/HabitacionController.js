const HabitacionService = require('../services/HabitacionService');

const getAll = async (req, res, next) => {
  try {
    const habitaciones = await HabitacionService.listHabitaciones();
    res.json(habitaciones);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const habitacion = await HabitacionService.getHabitacion(req.params.id);
    if (!habitacion) return res.status(404).json({ message: 'Habitación no encontrada' });
    res.json(habitacion);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const id = await HabitacionService.addHabitacion(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const id = await HabitacionService.updateHabitacion(req.params.id, req.body);
    res.status(200).json({ id, ...req.body });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = await HabitacionService.deleteHabitacion(req.params.id);
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
