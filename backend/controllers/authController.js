const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

// REGISTER - Creare cont nou
exports.register = async (req, res) => {
  try {
    // Validare input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, parola, nume_complet, telefon, rol } = req.body;

    // Verifică dacă username există deja
    const userCheck = await pool.query(
      'SELECT id FROM utilizatori WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username sau email există deja.'
      });
    }

    // Hash parolă
    const salt = await bcrypt.genSalt(10);
    const parola_hash = await bcrypt.hash(parola, salt);

    // Inserează user nou
    const result = await pool.query(
      `INSERT INTO utilizatori (username, email, parola_hash, nume_complet, telefon, rol) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, email, rol, nume_complet, creat_la`,
      [username, email, parola_hash, nume_complet, telefon, rol || 'user']
    );

    const user = result.rows[0];

    // Generează JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Cont creat cu succes!',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          rol: user.rol,
          nume_complet: user.nume_complet
        },
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la crearea contului.',
      error: error.message
    });
  }
};

// LOGIN - Autentificare
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, parola } = req.body;

    // Caută user
    const result = await pool.query(
      'SELECT * FROM utilizatori WHERE username = $1 AND activ = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Username sau parolă incorecte.'
      });
    }

    const user = result.rows[0];

    // Verifică parola
    const isMatch = await bcrypt.compare(parola, user.parola_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username sau parolă incorecte.'
      });
    }

    // Generează JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Autentificare reușită!',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          rol: user.rol,
          nume_complet: user.nume_complet
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la autentificare.',
      error: error.message
    });
  }
};

// GET PROFILE - Info user curent
exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, rol, nume_complet, telefon, creat_la 
       FROM utilizatori 
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User nu a fost găsit.'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea profilului.',
      error: error.message
    });
  }
};

// PUT /api/auth/profile - Actualizare profil
exports.updateProfile = async (req, res) => {
  try {
    const { nume_complet, email, telefon } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Emailul este obligatoriu.' });
    }

    // Check email uniqueness (excluding current user)
    const emailCheck = await pool.query(
      'SELECT id FROM utilizatori WHERE email = $1 AND id != $2',
      [email, req.user.id]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Acest email este deja folosit de alt utilizator.' });
    }

    const result = await pool.query(
      `UPDATE utilizatori SET nume_complet=$1, email=$2, telefon=$3, actualizat_la=CURRENT_TIMESTAMP
       WHERE id=$4
       RETURNING id, username, email, rol, nume_complet, telefon`,
      [nume_complet || null, email, telefon || null, req.user.id]
    );

    res.json({ success: true, message: 'Profil actualizat cu succes!', data: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Eroare la actualizarea profilului.', error: error.message });
  }
};

// PUT /api/auth/password - Schimbare parolă
exports.updatePassword = async (req, res) => {
  try {
    const { parola_noua } = req.body;

    if (!parola_noua || parola_noua.length < 6) {
      return res.status(400).json({ success: false, message: 'Parola trebuie să aibă minim 6 caractere.' });
    }

    const salt = await bcrypt.genSalt(10);
    const parola_hash = await bcrypt.hash(parola_noua, salt);

    await pool.query(
      'UPDATE utilizatori SET parola_hash=$1, actualizat_la=CURRENT_TIMESTAMP WHERE id=$2',
      [parola_hash, req.user.id]
    );

    res.json({ success: true, message: 'Parola a fost schimbată cu succes!' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, message: 'Eroare la schimbarea parolei.', error: error.message });
  }
};