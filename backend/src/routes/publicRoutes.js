const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/public/landing-data
router.get('/landing-data', async (req, res, next) => {
  try {
    const [habitaciones] = await db.execute('SELECT * FROM habitacion WHERE Estado = 1 ORDER BY Costo ASC');
    const [servicios] = await db.execute('SELECT * FROM servicios WHERE Estado = 1');
    const [paquetes] = await db.execute('SELECT * FROM paquetes WHERE Estado = 1');

    const mappedHabitaciones = habitaciones.map(h => ({
      ...h,
      ImagenHabitacion: h.ImagenHabitacion ? h.ImagenHabitacion.toString('utf8') : null
    }));

    res.json({
      habitaciones: mappedHabitaciones,
      servicios,
      paquetes
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
