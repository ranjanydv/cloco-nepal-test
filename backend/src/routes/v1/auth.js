const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth');
const { authMiddleware } = require('../../middleware/auth');

// Register and Login routes
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
// router.post('/refresh-token', authController.refreshToken);
module.exports = router;
