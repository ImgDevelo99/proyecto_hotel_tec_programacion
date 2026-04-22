const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { verifyToken } = require('../middlewares/auth');

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Ruta de prueba para validar que el token funciona e inyectar el set completo de base de datos
router.get('/me', verifyToken, AuthController.me);

module.exports = router;
