const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const userRoutes = require('./user');

router.get("/", (req, res) => {
	res.json({
		message: "Welcome to api service V1.",
	});
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/user', userRoutes);

module.exports = router;