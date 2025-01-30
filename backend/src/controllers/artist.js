const pool = require('../db/db');
const argon2 = require('argon2');


const getSingleArtistByUser = async (req, res) => {
	const { id } = req.params;
	const artist = await pool.query('SELECT * FROM artists WHERE user_id = $1', [id]);
	res.json({ message: 'Artist fetched successfully', data: artist.rows[0] });
};

const createArtist = async (req, res) => {
	const {
		first_name,
		last_name,
		email,
		dob,
		gender,
		address,
		first_release_year,
		no_of_albums_released,
		manager_id
	} = req.body;

	// Input validation
	if (!first_name || !last_name || !email || !dob || !gender || !address || !first_release_year || !no_of_albums_released) {
		return res.status(400).json({ message: 'All fields are required' });
	}

	const client = await pool.connect();

	try {
		await client.query('BEGIN');
		// Check if user already exists
		const checkUserQuery = 'SELECT id FROM users WHERE email = $1';
		const existingUser = await client.query(checkUserQuery, [email.toLowerCase()]);

		if (existingUser.rows.length > 0) {
			await client.query('ROLLBACK');
			return res.status(400).json({ message: 'User with this email already exists' });
		}

		// Hash the password
		const hashedPassword = await argon2.hash('artist');

		// Create new user
		const createUserQuery = `
            INSERT INTO users (first_name, last_name, email, password, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;
		const userResult = await client.query(createUserQuery, [
			first_name,
			last_name,
			email.toLowerCase(),
			hashedPassword,
			'artist' // role
		]);

		const userId = userResult.rows[0].id;

		// Create artist entry
		const createArtistQuery = `
            INSERT INTO artists (name, dob, gender, address, first_release_year, no_of_albums_released, user_id, manager_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

		const artistName = `${first_name} ${last_name}`;
		const artistResult = await client.query(createArtistQuery, [
			artistName,
			dob,
			gender,
			address,
			first_release_year,
			no_of_albums_released,
			userId,
			req.user.userId
		]);

		await client.query('COMMIT');

		res.status(201).json({
			message: 'Artist created successfully',
			data: artistResult.rows[0]
		});

	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error creating artist:', error);
		res.status(500).json({ message: 'Internal server error', error: error.message });
	} finally {
		client.release();
	}
};

const getArtists = async (req, res) => {
	const { page = 1, size = 10, search = '' } = req.query;
	const offset = (page - 1) * size;

	try {
		let countQuery, query, queryParams;

		if (search) {
			const searchTerm = `%${search}%`;
			// Query with search
			countQuery = `
                SELECT COUNT(*) 
                FROM artists 
                WHERE name ILIKE $1
            `;
			query = `
                SELECT 
                    a.*,
                    ua.id AS user_id,
                    ua.first_name AS user_first_name,
                    ua.last_name AS user_last_name,
                    ua.email AS user_email,
                    um.id AS manager_id,
                    um.first_name AS manager_first_name,
                    um.last_name AS manager_last_name,
                    um.email AS manager_email
                FROM artists a
                INNER JOIN users ua ON a.user_id = ua.id
                INNER JOIN users um ON a.manager_id = um.id
                WHERE a.name ILIKE $1
                ORDER BY a.created_at DESC
                LIMIT $2 OFFSET $3
            `;
			queryParams = [searchTerm, size, offset];
		} else {
			// Query without search
			countQuery = 'SELECT COUNT(*) FROM artists';
			query = `
                SELECT 
                    a.*,
                    ua.id AS user_id,
                    ua.first_name AS user_first_name,
                    ua.last_name AS user_last_name,
                    ua.email AS user_email,
                    um.id AS manager_id,
                    um.first_name AS manager_first_name,
                    um.last_name AS manager_last_name,
                    um.email AS manager_email
                FROM artists a
                INNER JOIN users ua ON a.user_id = ua.id
                INNER JOIN users um ON a.manager_id = um.id
                ORDER BY a.created_at DESC
                LIMIT $1 OFFSET $2
            `;
			queryParams = [size, offset];
		}

		// Get total count for pagination
		const totalCount = await pool.query(countQuery, queryParams.slice(0, search ? 1 : 0));

		// Get paginated results
		const result = await pool.query(query, queryParams);

		// Format the response
		const formattedData = formatArtistData(result.rows);

		// Add pagination metadata
		const pagination = {
			total: parseInt(totalCount.rows[0].count),
			page: parseInt(page),
			size: parseInt(size),
			pages: Math.ceil(parseInt(totalCount.rows[0].count) / size)
		};

		return res.status(200).json({
			message: 'Artists fetched successfully',
			data: formattedData,
			pagination
		});

	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to fetch artists' });
	}
};

const getArtistsByManager = async (req, res) => {
	const { page = 1, size = 10, search = '' } = req.query;
	const offset = (page - 1) * size;
	const managerId = req.user.userId;

	try {
		let countQuery, query, queryParams, countQueryParams;

		if (search) {
			const searchTerm = `%${search}%`;
			countQuery = `
                SELECT COUNT(*) 
                FROM artists 
                WHERE name ILIKE $1 AND manager_id = $2
            `;
			query = `
                SELECT 
                    a.*,
                    ua.id AS user_id,
                    ua.first_name AS user_first_name,
                    ua.last_name AS user_last_name,
                    ua.email AS user_email,
                    um.id AS manager_id,
                    um.first_name AS manager_first_name,
                    um.last_name AS manager_last_name,
                    um.email AS manager_email
                FROM artists a
                INNER JOIN users ua ON a.user_id = ua.id
                INNER JOIN users um ON a.manager_id = um.id
                WHERE a.name ILIKE $1 AND a.manager_id = $2
                ORDER BY a.created_at DESC
                LIMIT $3 OFFSET $4
            `;
			queryParams = [searchTerm, managerId, size, offset];
			countQueryParams = [searchTerm, managerId];
		} else {
			countQuery = 'SELECT COUNT(*) FROM artists WHERE manager_id = $1';
			query = `
                SELECT 
                    a.*,
                    ua.id AS user_id,
                    ua.first_name AS user_first_name,
                    ua.last_name AS user_last_name,
                    ua.email AS user_email,
                    um.id AS manager_id,
                    um.first_name AS manager_first_name,
                    um.last_name AS manager_last_name,
                    um.email AS manager_email
                FROM artists a
                INNER JOIN users ua ON a.user_id = ua.id
                INNER JOIN users um ON a.manager_id = um.id
                WHERE a.manager_id = $1
                ORDER BY a.created_at DESC
                LIMIT $2 OFFSET $3
            `;
			queryParams = [managerId, size, offset];
			countQueryParams = [managerId];
		}

		// Get total count for pagination
		const totalCount = await pool.query(countQuery, countQueryParams);
		const total = totalCount.rows.length ? parseInt(totalCount.rows[0].count) : 0;

		// Get paginated results
		const result = await pool.query(query, queryParams);

		// Format the response
		const formattedData = formatArtistData(result.rows);

		// Add pagination metadata
		const pagination = {
			total,
			page: parseInt(page),
			size: parseInt(size),
			pages: total ? Math.ceil(total / size) : 0
		};

		return res.status(200).json({
			message: 'Artists fetched successfully',
			data: formattedData,
			pagination
		});

	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to fetch artists' });
	}
};


// Reusable function to format artist data
const formatArtistData = (rows) => {
	return rows.map(row => ({
		id: row.id,
		name: row.name,
		dob: row.dob,
		gender: row.gender,
		address: row.address,
		first_release_year: row.first_release_year,
		no_of_albums_released: row.no_of_albums_released,
		created_at: row.created_at,
		updated_at: row.updated_at,
		user_id: row.user_id,
		user: {
			id: row.user_id,
			first_name: row.user_first_name,
			last_name: row.user_last_name,
			email: row.user_email
		},
		manager_id: row.manager_id,
		manager: {
			id: row.manager_id,
			first_name: row.manager_first_name,
			last_name: row.manager_last_name,
			email: row.manager_email
		}
	}));
};

const getSingleArtist = async (req, res) => {
	const { id } = req.params;

	try {
		const query = `
            SELECT 
                a.*,
                ua.id AS user_id,
                ua.first_name AS user_first_name,
                ua.last_name AS user_last_name,
                ua.email AS user_email,
				um.id AS manager_id,
				um.first_name AS manager_first_name,
				um.last_name AS manager_last_name,
				um.email AS manager_email
                FROM artists a
                INNER JOIN users ua ON a.user_id = ua.id
                INNER JOIN users um ON a.manager_id = um.id
                WHERE a.id = $1
            `;
		const result = await pool.query(query, [id]);

		if (result.rows.length === 0) {
			return res.status(400).json({ message: 'Artist not found' });
		}

		const artist = result.rows[0];
		const formattedData = formatArtistData([artist]);


		res.json({ message: 'Artist fetched successfully', data: formattedData[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to fetch artist' });
	}
};

const updateArtist = async (req, res) => {
	const { id } = req.params;
	const {
		first_name,
		last_name,
		email,
		dob,
		gender,
		address,
		first_release_year,
		no_of_albums_released,
	} = req.body;

	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		// Check if artist exists
		const checkArtistQuery = 'SELECT user_id FROM artists WHERE id = $1';
		const artistExists = await client.query(checkArtistQuery, [id]);

		if (artistExists.rows.length === 0) {
			await client.query('ROLLBACK');
			return res.status(404).json({ message: 'Artist not found' });
		}

		const userId = artistExists.rows[0].user_id;

		// Check if email is being changed and if it's already taken
		if (email) {
			const checkEmailQuery = 'SELECT id FROM users WHERE email = $1 AND id != $2';
			const existingUser = await client.query(checkEmailQuery, [email.toLowerCase(), userId]);

			if (existingUser.rows.length > 0) {
				await client.query('ROLLBACK');
				return res.status(400).json({ message: 'Email already taken' });
			}
		}

		// Update user information
		const updateUserQuery = `
            UPDATE users 
            SET first_name = $1, 
                last_name = $2, 
                email = $3,
                updated_at = NOW()
            WHERE id = $4
        `;
		await client.query(updateUserQuery, [
			first_name,
			last_name,
			email.toLowerCase(),
			userId
		]);

		// Update artist information
		const artistName = `${first_name} ${last_name}`;
		const updateArtistQuery = `
            UPDATE artists 
            SET name = $1,
                dob = $2,
                gender = $3,
                address = $4,
                first_release_year = $5,
                no_of_albums_released = $6,
                updated_at = NOW()
            WHERE id = $8
            RETURNING *
        `;
		const artistResult = await client.query(updateArtistQuery, [
			artistName,
			dob,
			gender,
			address,
			first_release_year,
			no_of_albums_released,
			id
		]);

		await client.query('COMMIT');

		res.json({
			message: 'Artist updated successfully',
			data: artistResult.rows[0]
		});
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error updating artist:', error);
		res.status(500).json({ message: 'Failed to update artist', error: error.message });
	} finally {
		client.release();
	}
};

const deleteArtist = async (req, res) => {
	const { id } = req.params;
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		// Check if artist exists and get user_id
		const checkArtistQuery = 'SELECT user_id FROM artists WHERE id = $1';
		const artistExists = await client.query(checkArtistQuery, [id]);

		if (artistExists.rows.length === 0) {
			await client.query('ROLLBACK');
			return res.status(404).json({ message: 'Artist not found' });
		}

		const userId = artistExists.rows[0].user_id;

		// Delete artist record first (due to foreign key constraint)
		const deleteArtistQuery = 'DELETE FROM artists WHERE id = $1';
		await client.query(deleteArtistQuery, [id]);

		// Delete user record
		const deleteUserQuery = 'DELETE FROM users WHERE id = $1';
		await client.query(deleteUserQuery, [userId]);

		await client.query('COMMIT');

		res.json({ message: 'Artist deleted successfully' });
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error deleting artist:', error);
		res.status(500).json({ message: 'Failed to delete artist', error: error.message });
	} finally {
		client.release();
	}
};

module.exports = {
	createArtist,
	getArtists,
	getArtistsByManager,
	getSingleArtist,
	updateArtist,
	deleteArtist,
	getSingleArtistByUser
};

