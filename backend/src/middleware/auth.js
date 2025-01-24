const jwt = require('jsonwebtoken');
const pool = require('../db/db');

const authMiddleware = async (req, res, next) => {
	const accessToken = req.cookies.accessToken;

	if (!accessToken) {
		return res.status(401).json({ error: 'Access denied' });
	}

	try {
		const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

		const query = 'SELECT * FROM users WHERE id = $1';
		const result = await pool.query(query, [decoded.userId]);

		if (result.rows.length === 0) {
			return res.status(401).json({ error: 'Invalid token' });
		}

		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ error: 'Invalid token' });
	}
};

module.exports = authMiddleware;