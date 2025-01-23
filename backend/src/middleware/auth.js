const jwt = require('jsonwebtoken');
const pool = require('../db/db');

const authMiddleware = async (req, res, next) => {
	const accessToken = req.cookies.accessToken;
	console.log('Access Token:', accessToken); // Debugging: Log the token

	if (!accessToken) {
		console.log('No access token found'); // Debugging: Log if no token is found
		return res.status(401).json({ error: 'Access denied' });
	}

	try {
		const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
		console.log('Decoded Token:', decoded); // Debugging: Log the decoded token

		const query = 'SELECT * FROM users WHERE id = $1';
		const result = await pool.query(query, [decoded.userId]);

		if (result.rows.length === 0) {
			console.log('User not found in database'); // Debugging: Log if user is not found
			return res.status(401).json({ error: 'Invalid token' });
		}

		req.user = decoded;
		next();
	} catch (error) {
		console.error('Token verification failed:', error); // Debugging: Log the error
		res.status(401).json({ error: 'Invalid token' });
	}
};

module.exports = authMiddleware;