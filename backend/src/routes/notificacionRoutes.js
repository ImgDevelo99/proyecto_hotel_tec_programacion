const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/auth');

// GET /api/notificaciones - Obtener notificaciones para el rol del usuario
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const role = req.user.role || req.user.IDRol;
    const [rows] = await db.execute(
      'SELECT * FROM notificaciones WHERE IDRolDestino = ? ORDER BY FechaCreacion DESC LIMIT 50',
      [role]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/notificaciones/no-leidas/count - Obtener cantidad de no leídas
router.get('/no-leidas/count', verifyToken, async (req, res, next) => {
  try {
    const role = req.user.role || req.user.IDRol;
    const [rows] = await db.execute(
      'SELECT COUNT(*) as unreadCount FROM notificaciones WHERE IDRolDestino = ? AND Leida = 0',
      [role]
    );
    res.json({ count: rows[0].unreadCount });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notificaciones/:id/marcar-leida - Marcar una como leída
router.put('/:id/marcar-leida', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE notificaciones SET Leida = 1 WHERE IdNotificacion = ?', [id]);
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notificaciones/marcar-todas - Marcar todas como leídas
router.put('/marcar-todas/todas', verifyToken, async (req, res, next) => {
  try {
    const role = req.user.role || req.user.IDRol;
    await db.execute('UPDATE notificaciones SET Leida = 1 WHERE IDRolDestino = ? AND Leida = 0', [role]);
    res.json({ message: 'Todas marcadas como leídas' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
