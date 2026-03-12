const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Prea multe cereri. Încearcă din nou mai târziu.' }
});

// Routes
const authRoutes = require('./routes/auth');
const clientiRoutes = require('./routes/clienti');
const pool = require('./config/database');
const { authMiddleware } = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/clienti', clientiRoutes);

// GET /api/stats - Statistici dashboard (real data)
app.get('/api/stats', apiLimiter, authMiddleware, async (req, res) => {
  try {
    const [clientiResult, lucrariResult, materialeResult, angajatiResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM clienti WHERE activ = true'),
      pool.query(`SELECT COUNT(*) FROM lucrari WHERE status NOT IN ('finalizata', 'anulata')`),
      pool.query('SELECT COUNT(*) FROM materiale WHERE activ = true AND stoc_curent > 0'),
      pool.query('SELECT COUNT(*) FROM angajati WHERE activ = true')
    ]);

    res.json({
      success: true,
      data: {
        clienti: parseInt(clientiResult.rows[0].count),
        lucrari: parseInt(lucrariResult.rows[0].count),
        materiale: parseInt(materialeResult.rows[0].count),
        angajati: parseInt(angajatiResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea statisticilor',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Ecoloptim InstalPro API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📍 Clienti API: http://localhost:${PORT}/api/clienti`);
});