const pool = require('../db/db');

const getDashboardData = async (req, res) => {
	try {
		// Fetch user data using raw SQL
		const query = 'SELECT id, first_name, last_name, email, role FROM users WHERE id = $1';
		const result = await pool.query(query, [req.user.userId]);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json({ message: 'Dashboard data', user: result.rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to fetch dashboard data' });
	}
};

module.exports = { getDashboardData };