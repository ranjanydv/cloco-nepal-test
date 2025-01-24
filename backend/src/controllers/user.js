const pool = require('../db/db');

const getUsers = async (req, res) => {
	const { page = 1, size = 10, search = '' } = req.query;
	const offset = (page - 1) * size;
	let searchTerm = '';

	try {
		let countQuery, query, queryParams;

		if (search) {
			const searchTerm = `%${search}%`;
			// Query with search
			countQuery = `
				SELECT COUNT(*) FROM users 
				WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
			`;
			query = `
				SELECT id, first_name, last_name, email, role, created_at 
				FROM users
				WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
				ORDER BY created_at DESC
				LIMIT $2 OFFSET $3
			`;
			queryParams = [searchTerm, size, offset];
		} else {
			// Query without search
			countQuery = 'SELECT COUNT(*) FROM users';
			query = `
				SELECT id, first_name, last_name, email, role, created_at 
				FROM users
				ORDER BY created_at DESC
				LIMIT $1 OFFSET $2
			`;
			queryParams = [size, offset];
		}

		// Get total count for pagination
		const totalCount = await pool.query(countQuery, search ? [searchTerm] : []);

		// Get paginated results
		const result = await pool.query(query, queryParams);

		// Add pagination metadata
		const pagination = {
			total: parseInt(totalCount.rows[0].count),
			page: parseInt(page),
			size: parseInt(size),
			pages: Math.ceil(parseInt(totalCount.rows[0].count) / size)
		};

		res.status(200).json({
			message: 'Users fetched successfully',
			data: result.rows,
			pagination
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to fetch users' });
	}
};

const getSingleUser = async (req, res) => {
	const { id } = req.body;

	try {
		const query = 'SELECT * FROM users WHERE id = $1';
		const result = await pool.query(query, [id]);

		if (result.rows.length === 0) {
			return res.status(400).json({ message: 'User not found' });
		}

		const user = result.rows[0];

		res.json({ message: 'User fetched successfully', data: user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to fetch user' });
	}
};


module.exports = { getUsers, getSingleUser };
