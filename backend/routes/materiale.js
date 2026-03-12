const express = require('express');
const router = express.Router();
const materialeController = require('../controllers/materialeController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', materialeController.getMateriale);
router.get('/:id', materialeController.getMaterialById);
router.post('/', materialeController.createMaterial);
router.put('/:id', materialeController.updateMaterial);
router.delete('/:id', materialeController.deleteMaterial);

module.exports = router;
