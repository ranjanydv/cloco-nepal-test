const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const dashboardController = require('../../controllers/dashboard');

// Protected routes
router.get('/data', authMiddleware, dashboardController.getDashboardData);

module.exports = router;