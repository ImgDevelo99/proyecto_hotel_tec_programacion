const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Usuario = require('../models/Usuario');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Helper de RBAC: Retorna array de strings con los permisos (rutas web designadas)
const getPermissionsForRole = async (idRol) => {
  // El IDRol 1 es Administrador, tiene acceso irrestricto
  if (idRol === 1) return ['ALL'];
  
  const [rows] = await db.execute(`
    SELECT p.NombrePermisos
    FROM permisos p
    JOIN rolespermisos rp ON p.IDPermiso = rp.IDPermiso
    WHERE rp.IDRol = ? AND (p.EstadoPermisos = 'Activo' OR p.EstadoPermisos IS NULL)
  `, [idRol]);
  
  return rows.map(r => r.NombrePermisos);
};

// Utilidad para simular o mandar correos
const sendEmail = async (to, subject, text) => {
  // Configuración de prueba o SMTP real de HotelSys
  // Para evitar errores si no hay credenciales, solo hacemos log si falta config
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[SIMULACIÓN EMAIL] Hacia: ${to}`);
    console.log(`[Asunto]: ${subject}`);
    console.log(`[Contenido]: ${text}`);
    return;
  }
  
  const transporter = nodemailer.createTransport({
    service: 'gmail', // o tu proveedor
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: '"HotelSys Auth" <no-reply@hotelsys.com>',
    to,
    subject,
    text
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // 1. Verificar si el usuario existe
    const user = await Usuario.getByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 2. Verificar contraseña
    const isValid = await bcrypt.compare(password, user.Contrasena);
    if (!isValid && password !== user.Contrasena) { 
      // Fallback allowed for non-hashed old passwords during development (optional)
      // En prod, quitar `&& password !== user.Contrasena`
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Generar JWT
    const token = jwt.sign(
      { id: user.IDUsuario, role: user.IDRol, email: user.Email, name: user.NombreUsuario },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Obtener los permisos del usuario
    const permissions = await getPermissionsForRole(user.IDRol);

    // No enviamos el hash de la clave al frontend
    delete user.Contrasena;

    res.json({ token, user: { ...user, permissions } });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { email, password, nombre, apellido, idRol } = req.body;

    // Verificar unicidad de email
    const existing = await Usuario.getByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      NombreUsuario: nombre,
      Contrasena: hashedPassword,
      Apellido: apellido,
      Email: email,
      IDRol: idRol || 2 // Rol por defecto (ej. recepcionista/huesped) si no se manda
    };

    const newUserId = await Usuario.create(newUser);
    res.status(201).json({ message: 'Usuario registrado exitosamente', id: newUserId });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await Usuario.getByEmail(email);
    if (!user) {
      // Para evitar ataques de enumeración, devolvemos success igual
      return res.json({ message: 'Si el correo existe, se enviaron instrucciones' });
    }

    // Crear token temporal de reseteo corto (15 min)
    const resetToken = jwt.sign({ id: user.IDUsuario }, JWT_SECRET, { expiresIn: '15m' });
    
    // Link imaginario para frontend
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    await sendEmail(
      email, 
      'Recuperación de Contraseña - HotelSys', 
      `Hola ${user.NombreUsuario}, ingresa a este enlace para resetear tu clave: ${resetUrl}`
    );

    res.json({ message: 'Si el correo existe, se enviaron instrucciones' });
  } catch (error) {
    next(error);
  }
};



const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // 1. Validar Token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Usuario.getById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 2. Hash nueva clave
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Actualizar
    await Usuario.update(user.IDUsuario, { ...user, Contrasena: hashedPassword });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    return res.status(400).json({ message: 'Token expirado o inválido' });
  }
};

const me = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
       return res.status(401).json({ message: 'No autenticado' });
    }
    const user = await Usuario.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const permissions = await getPermissionsForRole(user.IDRol);
    delete user.Contrasena;
    res.json({ user: { ...user, permissions } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  me
};
