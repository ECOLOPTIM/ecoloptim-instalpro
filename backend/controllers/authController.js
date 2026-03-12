const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'ecoloptim_secret_key_2024';
const JWT_EXPIRATION = '24h';

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username, password });

    if (!username || !password) {
      return res.status(400).json({ message: 'Username și parolă sunt obligatorii' });
    }

    const result = await pool.query(
      'SELECT * FROM utilizatori WHERE username = $1 AND activ = true',
      [username]
    );

    console.log('👤 User found:', result.rows.length > 0);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credențiale invalide' });
    }

    const user = result.rows[0];
    console.log('🔑 Stored hash:', user.password);
    console.log('🔑 Hash length:', user.password?.length);

    const validPassword = await bcrypt.compare(password, user.password);
    console.log('✅ Password valid:', validPassword);

    if (!validPassword) {
      return res.status(401).json({ message: 'Credențiale invalide' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        rol: user.rol 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nume_complet: user.nume_complet,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Eroare la autentificare' });
  }
};

// Register
const register = async (req, res) => {
  try {
    const { username, password, email, nume_complet, rol } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username și parolă sunt obligatorii' });
    }

    const existingUser = await pool.query(
      'SELECT * FROM utilizatori WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Username sau email deja există' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO utilizatori (username, password, email, nume_complet, rol, activ) VALUES ($1, $2, $3, $4, $5, true) RETURNING id, username, email, nume_complet, rol',
      [username, hashedPassword, email, nume_complet, rol || 'user']
    );

    res.status(201).json({
      message: 'Utilizator creat cu succes',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Eroare la înregistrare' });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, nume_complet, rol, created_at FROM utilizatori WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Eroare la obținerea profilului' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { email, nume_complet, password } = req.body;
    const userId = req.user.id;

    let query = 'UPDATE utilizatori SET ';
    const values = [];
    let paramCount = 1;

    if (email) {
      query += `email = $${paramCount}, `;
      values.push(email);
      paramCount++;
    }

    if (nume_complet) {
      query += `nume_complet = $${paramCount}, `;
      values.push(nume_complet);
      paramCount++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `password = $${paramCount}, `;
      values.push(hashedPassword);
      paramCount++;
    }

    query += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, username, email, nume_complet, rol`;
    values.push(userId);

    const result = await pool.query(query, values);

    res.json({
      message: 'Profil actualizat cu succes',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Eroare la actualizarea profilului' });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile
};