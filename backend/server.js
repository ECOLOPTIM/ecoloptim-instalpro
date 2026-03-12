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

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Prea multe cereri. Încearcă din nou mai târziu.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Prea multe încercări de autentificare. Încearcă din nou în 15 minute.' }
});

// Load routes and dependencies
const authRoutes = require('./routes/auth');
const clientiRoutes = require('./routes/clienti');
const lucrariRoutes = require('./routes/lucrari');
const materialeRoutes = require('./routes/materiale');
const angajatiRoutes = require('./routes/angajati');
const pool = require('./config/database');
const { authMiddleware } = require('./middleware/auth');

// Register routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/clienti', apiLimiter, clientiRoutes);
app.use('/api/lucrari', apiLimiter, lucrariRoutes);
app.use('/api/materiale', apiLimiter, materialeRoutes);
app.use('/api/angajati', apiLimiter, angajatiRoutes);

// GET /api/stats - Statistici dashboard
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
    res.status(500).json({ success: false, message: 'Eroare la obținerea statisticilor', error: error.message });
  }
});

// GET /api/dashboard/activitate - Activitate recentă (real data)
app.get('/api/dashboard/activitate', apiLimiter, authMiddleware, async (req, res) => {
  try {
    const clientiRecenti = await pool.query(
      `SELECT 'client_nou' AS tip, id, nume AS titlu, creat_la AS data
       FROM clienti WHERE activ = true
       ORDER BY creat_la DESC LIMIT 5`
    );

    const lucrariRecente = await pool.query(
      `SELECT ('lucrare_' || status) AS tip, id, nume_lucrare AS titlu, actualizat_la AS data
       FROM lucrari
       ORDER BY actualizat_la DESC LIMIT 5`
    );

    const all = [
      ...clientiRecenti.rows,
      ...lucrariRecente.rows
    ].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 10);

    res.json({ success: true, data: all });
  } catch (error) {
    console.error('Activitate error:', error);
    res.status(500).json({ success: false, message: 'Eroare la obținerea activității', error: error.message });
  }
});

// GET /api/dashboard/notificari - Notificări reale
app.get('/api/dashboard/notificari', apiLimiter, authMiddleware, async (req, res) => {
  try {
    const notificari = [];

    const stocScazut = await pool.query(
      'SELECT COUNT(*) FROM materiale WHERE activ = true AND stoc_curent < stoc_minim AND stoc_minim > 0'
    );
    const nrStocScazut = parseInt(stocScazut.rows[0].count);
    if (nrStocScazut > 0) {
      notificari.push({
        tip: 'warning',
        mesaj: `${nrStocScazut} ${nrStocScazut === 1 ? 'material are' : 'materiale au'} stocul sub limita minimă`
      });
    }

    const lucrariScadente = await pool.query(
      `SELECT COUNT(*) FROM lucrari
       WHERE status NOT IN ('finalizata', 'anulata')
       AND data_finalizare_planificata IS NOT NULL
       AND data_finalizare_planificata BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
    );
    const nrLucrariScadente = parseInt(lucrariScadente.rows[0].count);
    if (nrLucrariScadente > 0) {
      notificari.push({
        tip: 'info',
        mesaj: `${nrLucrariScadente} ${nrLucrariScadente === 1 ? 'lucrare are' : 'lucrări au'} termenul în următoarele 7 zile`
      });
    }

    const lucrariIntarziate = await pool.query(
      `SELECT COUNT(*) FROM lucrari
       WHERE status NOT IN ('finalizata', 'anulata')
       AND data_finalizare_planificata IS NOT NULL
       AND data_finalizare_planificata < CURRENT_DATE`
    );
    const nrLucrariIntarziate = parseInt(lucrariIntarziate.rows[0].count);
    if (nrLucrariIntarziate > 0) {
      notificari.push({
        tip: 'danger',
        mesaj: `${nrLucrariIntarziate} ${nrLucrariIntarziate === 1 ? 'lucrare este' : 'lucrări sunt'} depășit${nrLucrariIntarziate === 1 ? 'ă' : 'e'} ca termen`
      });
    }

    res.json({ success: true, data: notificari });
  } catch (error) {
    console.error('Notificari error:', error);
    res.status(500).json({ success: false, message: 'Eroare la obținerea notificărilor', error: error.message });
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
  res.status(404).json({ success: false, message: 'Endpoint not found' });
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
  console.log(`📍 Lucrari API: http://localhost:${PORT}/api/lucrari`);
  console.log(`📍 Materiale API: http://localhost:${PORT}/api/materiale`);
  console.log(`📍 Angajati API: http://localhost:${PORT}/api/angajati`);
});
