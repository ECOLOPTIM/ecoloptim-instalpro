const express = require('express');
const router = express.Router();
const clientiController = require('../controllers/clientiController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', clientiController.getAllClienti);
router.get('/:id', clientiController.getClientById);
router.post('/', clientiController.createClient);
router.put('/:id', clientiController.updateClient);
router.delete('/:id', clientiController.deleteClient);

module.exports = router;