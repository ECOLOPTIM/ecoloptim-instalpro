const express = require('express');
const router = express.Router();
const angajatiController = require('../controllers/angajatiController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', angajatiController.getAngajati);
router.get('/:id', angajatiController.getAngajatById);
router.post('/', angajatiController.createAngajat);
router.put('/:id', angajatiController.updateAngajat);
router.delete('/:id', angajatiController.deleteAngajat);

module.exports = router;
