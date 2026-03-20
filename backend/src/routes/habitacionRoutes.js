const express = require('express');
const router = express.Router();
const HabitacionController = require('../controllers/HabitacionController');

router.get('/', HabitacionController.getAll);
router.get('/:id', HabitacionController.getById);
router.post('/', HabitacionController.create);
router.put('/:id', HabitacionController.update);
router.delete('/:id', HabitacionController.remove);
module.exports = router;
