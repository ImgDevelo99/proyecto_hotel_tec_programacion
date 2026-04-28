const express = require('express');
const router = express.Router();
const C = require('../controllers/ReservaController');

router.get('/', C.getAll);
router.get('/:id', C.getById);
router.get('/:id/paquetes', C.getPaquetes);
router.get('/:id/servicios', C.getServicios);
router.post('/', C.create);
router.put('/:id', C.update);
router.delete('/:id', C.remove);

module.exports = router;
