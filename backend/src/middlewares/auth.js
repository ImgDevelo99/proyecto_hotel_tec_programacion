const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'No se proveyó un token' });
  }

  try {
    // Expected format: "Bearer <token>"
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded; // ej: { id, role, email }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado / Token inválido' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    // Suponiendo que req.user.role sea el IDRol o el nombre de rol
    if (roles.includes(req.user.role) || roles.includes(req.user.roleName)) {
      next();
    } else {
      res.status(403).json({ message: 'No tienes el rol requerido para esta acción' });
    }
  };
};

module.exports = {
  verifyToken,
  checkRole
};
