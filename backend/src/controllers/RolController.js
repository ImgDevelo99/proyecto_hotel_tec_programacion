const RolService = require('../services/RolService');

const getAll = async (req, res, next) => {
  try { res.json(await RolService.listRoles()); }
  catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const item = await RolService.getRol(req.params.id);
    if (!item) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json(item);
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const id = await RolService.addRol(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === 1) {
      return res.status(403).json({ message: 'Acción denegada: El rol Super Administrador no puede ser modificado.' });
    }
    const id = await RolService.updateRol(req.params.id, req.body);
    if (!id) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json({ id, ...req.body });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === 1) {
      return res.status(403).json({ message: 'Acción denegada: El rol Super Administrador no puede ser eliminado.' });
    }
    const id = await RolService.deleteRol(req.params.id);
    if (!id) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json({ id });
  } catch (error) { 
    if(error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'No se puede eliminar: El rol está asignado a uno o más usuarios o permisos.' });
    }
    next(error); 
  }
};

module.exports = { getAll, getById, create, update, remove };
