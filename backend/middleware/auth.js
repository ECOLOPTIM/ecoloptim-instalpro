const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set - using default insecure key. Set JWT_SECRET in your environment.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'ecoloptim-secret-key-2024-super-secure';

const authMiddleware = (req, res, next) => {
  try {
    // Extrage token din header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Acces interzis. Token lipsă.' });
    }

    const token = authHeader.split(' ')[1];

    // Verifică token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Adaugă user info în request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      rol: decoded.rol
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token invalid sau expirat.' });
  }
};

module.exports = { authMiddleware };