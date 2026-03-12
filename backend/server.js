const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Prea multe cereri. Încearcă din nou mai târziu.' },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: 'Prea multe cereri. Încearcă din nou mai târziu.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/clienti', apiLimiter, require('./routes/clienti'));
app.use('/api/lucrari', apiLimiter, require('./routes/lucrari'));
app.use('/api/documente', apiLimiter, require('./routes/documente'));
app.use('/api/facturi', apiLimiter, require('./routes/facturi'));
app.use('/api/dashboard', apiLimiter, require('./routes/dashboard'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Eroare server', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Test database connection
db.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected at:', result.rows[0].now);
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});