const express = require('express');
const router = express.Router();
const documenteController = require('../controllers/documenteController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', documenteController.getAllDocumente);
router.get('/lucrare/:lucrare_id', documenteController.getDocumenteByLucrare);
router.post('/', documenteController.createDocument);
router.delete('/:id', documenteController.deleteDocument);

module.exports = router;