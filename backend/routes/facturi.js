const express = require('express');
const router = express.Router();
const facturiController = require('../controllers/facturiController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', facturiController.getAllFacturi);
router.get('/:id', facturiController.getFacturaById);
router.post('/', facturiController.createFactura);
router.put('/:id', facturiController.updateFactura);
router.delete('/:id', facturiController.deleteFactura);

module.exports = router;