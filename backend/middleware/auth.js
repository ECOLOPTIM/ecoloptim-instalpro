const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ecoloptim_secret_key_2026';

// Middleware pentru verificare token JWT
const authMiddleware = (req, res, next) => {
  // Extrage token din header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acces interzis. Token lipsește.'
    });
  }

  try {
    // Verifică și decodează token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adaugă user info în request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalid sau expirat.'
    });
  }
};

// Middleware pentru verificare rol admin
const adminMiddleware = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acces interzis. Necesită rol de administrator.'
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, JWT_SECRET };