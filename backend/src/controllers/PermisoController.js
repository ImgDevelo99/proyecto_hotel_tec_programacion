const PermisoService = require('../services/PermisoService');

const getAll = async (req, res, next) => {
  try { res.json(await PermisoService.listPermisos()); }
  catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const item = await PermisoService.getPermiso(req.params.id);
    if (!item) return res.status(404).json({ message: 'Permiso no encontrado' });
    res.json(item);
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const id = await PermisoService.addPermiso(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const id = await PermisoService.updatePermiso(req.params.id, req.body);
    if (!id) return res.status(404).json({ message: 'Permiso no encontrado' });
    res.json({ id, ...req.body });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const id = await PermisoService.deletePermiso(req.params.id);
    if (!id) return res.status(404).json({ message: 'Permiso no encontrado' });
    res.json({ id });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove };
