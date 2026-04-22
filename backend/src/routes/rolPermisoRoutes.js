const express = require('express');
const router = express.Router();
const C = require('../controllers/RolPermisoController');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Obtener todos los vinculos
router.get('/', C.getAll);

// Obtener los IDs de permisos actuales de un Rol especifico
router.get('/by-rol/:idRol', C.getByRol);

// Sincronizar (reemplazar) todos los permisos de un Rol en bulk
router.put('/sync/:idRol', C.syncByRol);

router.get('/:id', C.getById);
router.post('/', C.create);
router.put('/:id', C.update);
router.delete('/:id', C.remove);

module.exports = router;
