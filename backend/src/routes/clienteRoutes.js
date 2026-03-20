const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');

router.get('/', ClienteController.getAll);
router.get('/:id', ClienteController.getById);
router.post('/', ClienteController.create);
router.put('/:id', ClienteController.update);
router.delete('/:id', ClienteController.remove);

module.exports = router;
