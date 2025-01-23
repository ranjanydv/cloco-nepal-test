const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');

router.get("/", (req, res) => {
	res.json({
		message: "Welcome to api service V1.",
	});
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;