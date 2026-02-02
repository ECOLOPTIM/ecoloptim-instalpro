const express = require('express');
const router = express.Router();
const clientiController = require('../controllers/clientiController');
const { authMiddleware } = require('../middleware/auth');

// Toate rutele necesită autentificare
router.use(authMiddleware);

// GET /api/clienti - Listă clienți
router.get('/', clientiController.getClienti);

// GET /api/clienti/:id - Detalii client
router.get('/:id', clientiController.getClientById);

// POST /api/clienti - Creare client
router.post('/', clientiController.createClient);

// PUT /api/clienti/:id - Modificare client
router.put('/:id', clientiController.updateClient);

// DELETE /api/clienti/:id - Ștergere client
router.delete('/:id', clientiController.deleteClient);

module.exports = router;