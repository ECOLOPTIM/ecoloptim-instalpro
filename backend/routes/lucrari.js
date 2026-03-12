const express = require('express');
const router = express.Router();
const lucrariController = require('../controllers/lucrariController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', lucrariController.getAllLucrari);
router.get('/:id', lucrariController.getLucrareById);
router.post('/', lucrariController.createLucrare);
router.put('/:id', lucrariController.updateLucrare);
router.delete('/:id', lucrariController.deleteLucrare);

module.exports = router;