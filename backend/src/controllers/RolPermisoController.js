const RolPermisoService = require('../services/RolPermisoService');
const RolPermiso = require('../models/RolPermiso');
const Permiso = require('../models/Permiso');

const getAll = async (req, res, next) => {
  try { res.json(await RolPermisoService.listRolesPermisos()); }
  catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const item = await RolPermisoService.getRolPermiso(req.params.id);
    if (!item) return res.status(404).json({ message: 'RolPermiso no encontrado' });
    res.json(item);
  } catch (error) { next(error); }
};

// Obtiene los IDs de permisos actuales de un rol
const getByRol = async (req, res, next) => {
  try {
    const permisos = await RolPermiso.getByRol(req.params.idRol);
    res.json(permisos);
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const id = await RolPermisoService.addRolPermiso(req.body);
    res.status(201).json({ id, ...req.body });
  } catch (error) { next(error); }
};

// Sincroniza (reemplaza) TODOS los permisos del rol de forma atómica
const syncByRol = async (req, res, next) => {
  try {
    const { idRol } = req.params;
    if (parseInt(idRol) === 1) {
      return res.status(403).json({ message: 'No se pueden modificar los permisos del Super Administrador.' });
    }
    const { idPermisos } = req.body; // array of permiso IDs
    if (!Array.isArray(idPermisos)) {
      return res.status(400).json({ message: 'idPermisos debe ser un array.' });
    }
    await RolPermiso.syncPermisos(idRol, idPermisos);
    res.json({ message: 'Permisos actualizados correctamente.' });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const id = await RolPermisoService.updateRolPermiso(req.params.id, req.body);
    if (!id) return res.status(404).json({ message: 'RolPermiso no encontrado' });
    res.json({ id, ...req.body });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const id = await RolPermisoService.deleteRolPermiso(req.params.id);
    if (!id) return res.status(404).json({ message: 'RolPermiso no encontrado' });
    res.json({ id });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, getByRol, syncByRol, create, update, remove };
