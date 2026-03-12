const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/lucrari-recente', dashboardController.getLucrariRecente);
router.get('/evolutie', dashboardController.getEvolutieLucrari);
router.get('/termene', dashboardController.getLucrariTermeneApropiate);

module.exports = router;