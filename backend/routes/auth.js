const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/register - Creare cont
router.post('/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username minim 3 caractere'),
    body('email').isEmail().withMessage('Email invalid'),
    body('parola').isLength({ min: 6 }).withMessage('Parola minim 6 caractere'),
    body('nume_complet').trim().notEmpty().withMessage('Nume complet este obligatoriu')
  ],
  authController.register
);

// POST /api/auth/login - Autentificare
router.post('/login',
  [
    body('username').trim().notEmpty().withMessage('Username este obligatoriu'),
    body('parola').notEmpty().withMessage('Parola este obligatorie')
  ],
  authController.login
);

// GET /api/auth/profile - Profil user (protejat)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;