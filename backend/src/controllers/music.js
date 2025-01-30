const pool = require('../db/db');

// utility functions
const musicBelongsToArtist = async (musicArtistId, requestArtistId) => {
	const query = `SELECT * FROM artists WHERE id = $1`;
	const result = await pool.query(query, [musicArtistId]);

	if (result.rows.length === 0) return false;

	return result.rows[0].user_id === requestArtistId;
};


const musicExists = async (id) => {
	const query = `SELECT * FROM music WHERE id = $1`;
	const result = await pool.query(query, [id]);

	return result.rows.length > 0 ? result.rows[0] : null;
}

const artistExistsFunc = async (userId) => {
	const query = `SELECT id FROM artists WHERE user_id = $1`;
	const result = await pool.query(query, [userId]);

	return result.rows.length > 0 ? result.rows[0] : null;
};



const createMusic = async (req, res) => {
	const { title, album_name, genre } = req.body;

	if (!title || !album_name || !genre) {
		return res.status(400).json({ message: 'All fields are required' });
	}

	const client = await pool.connect();

	try {
		const artistExists = await artistExistsFunc(req.user.userId);
		if (!artistExists) {
			return res.status(404).json({ message: 'Artist not found' });
		}

		const createMusicQuery = `
            INSERT INTO music (artist_id, title, album_name, genre)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
		const musicResult = await client.query(createMusicQuery, [
			artistExists.id,
			title,
			album_name,
			genre
		]);

		res.status(201).json({
			message: 'Music created successfully',
			data: musicResult.rows[0]
		});

	} catch (error) {
		console.error('Error creating music:', error);
		res.status(500).json({ message: 'Internal server error', error: error.message });
	} finally {
		client.release();
	}
};

const getMusic = async (req, res) => {
	const { page = 1, size = 10, search = '' } = req.query;
	const offset = (page - 1) * size;

	try {
		let countQuery, query, queryParams;

		if (search) {
			const searchTerm = `%${search}%`;
			// Query with search
			countQuery = `SELECT COUNT(*) FROM music WHERE name ILIKE $1`;
			query = `
                SELECT 
                    m.*,
                    ua.id AS user_id,
                    ua.first_name AS user_first_name,
                    ua.last_name AS user_last_name,
                    ua.email AS user_email,
                    um.id AS manager_id,
                    um.first_name AS manager_first_name,
                    um.last_name AS manager_last_name,
                    um.email AS manager_email
                FROM music m
                INNER JOIN artists a ON m.artist_id = a.id
                INNER JOIN users ua ON a.user_id = ua.id
                INNER JOIN users um ON a.manager_id = um.id
                WHERE m.title ILIKE $1
                ORDER BY m.created_at DESC
                LIMIT $2 OFFSET $3
            `;
			queryParams = [searchTerm, size, offset];
		} else {
			// Query without search
			countQuery = 'SELECT COUNT(*) FROM music';
			query = `
                SELECT 
                    m.*,
                    a.id AS artist_id,
                    a.name AS artist_name,
                    ua.id AS user_id,
                    ua.first_name AS user_first_name,
                    ua.last_name AS user_last_name,
                    ua.email AS user_email,
                    um.id AS manager_id,
                    um.first_name AS manager_first_name,
                    um.last_name AS manager_last_name,
                    um.email AS manager_email
                FROM music m
                INNER JOIN artists a ON m.artist_id = a.id
                INNER JOIN users ua ON a.user_id = ua.id
                INNER JOIN users um ON a.manager_id = um.id
                ORDER BY m.created_at DESC
                LIMIT $1 OFFSET $2
            `;
			queryParams = [size, offset];
		}

		// Get total count for pagination
		const totalCount = await pool.query(countQuery, queryParams.slice(0, search ? 1 : 0));

		// Get paginated results
		const result = await pool.query(query, queryParams);

		// Format the response
		const formattedData = formatMusicData(result.rows);

		// Add pagination metadata
		const pagination = {
			total: parseInt(totalCount.rows[0].count),
			page: parseInt(page),
			size: parseInt(size),
			pages: Math.ceil(parseInt(totalCount.rows[0].count) / size)
		};

		return res.status(200).json({
			message: 'Music fetched successfully',
			data: formattedData,
			pagination
		});

	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to fetch music' });
	}
};

const getMusicByArtist = async (req, res) => {
	const { id } = req.params;
	const page = parseInt(req.query.page) || 1;
	const size = parseInt(req.query.size) || 10;
	const offset = (page - 1) * size;

	try {
		// Get total count for pagination
		const countQuery = 'SELECT COUNT(*) FROM music WHERE artist_id = $1';
		const totalCountResult = await pool.query(countQuery, [id]);
		const totalCount = parseInt(totalCountResult.rows[0].count);

		// Fetch paginated music details with artist and user info
		const query = `
            SELECT 
                m.*,
                a.id AS artist_id,
                a.name AS artist_name,
                ua.id AS user_id,
                ua.first_name AS user_first_name,
                ua.last_name AS user_last_name,
                ua.email AS user_email,
                um.id AS manager_id,
                um.first_name AS manager_first_name,
                um.last_name AS manager_last_name,
                um.email AS manager_email
            FROM music m
            INNER JOIN artists a ON m.artist_id = a.id
            INNER JOIN users ua ON a.user_id = ua.id
            INNER JOIN users um ON a.manager_id = um.id
            WHERE m.artist_id = $1
            ORDER BY m.created_at DESC
            LIMIT $2 OFFSET $3
        `;
		const queryParams = [id, size, offset];
		const result = await pool.query(query, queryParams);

		// Format the response
		const formattedData = formatMusicData(result.rows);

		// Pagination metadata
		const pagination = {
			total: totalCount,
			page,
			size,
			pages: Math.ceil(totalCount / size),
		};

		return res.status(200).json({
			message: 'Music fetched successfully',
			data: formattedData,
			pagination,
		});

	} catch (error) {
		console.error('Error fetching music:', error);
		return res.status(500).json({ message: 'Failed to fetch music', error: error.message });
	}
};


// Reusable function to format artist data
const formatMusicData = (rows) => {
	return rows.map(row => ({
		id: row.id,
		title: row.title,
		album_name: row.album_name,
		genre: row.genre,
		created_at: row.created_at,
		updated_at: row.updated_at,
		artist_id: row.artist_id,
		artist: {
			id: row.artist_id,
			name: row.artist_name,
			user_id: row.user_id,
			email: row.user_email
		}
	}));
};

const updateMusic = async (req, res) => {
	const { id } = req.params;
	const { title, album_name, genre } = req.body;

	if (!title || !album_name || !genre) {
		return res.status(400).json({ message: 'All fields are required' });
	}

	const client = await pool.connect();

	try {
		const existingMusic = await musicExists(id);
		if (!existingMusic) {
			return res.status(404).json({ message: 'Music not found' });
		}

		const musicBelongsArtist = await musicBelongsToArtist(existingMusic.artist_id, req.user.userId);
		if (!musicBelongsArtist) {
			return res.status(403).json({ message: 'You are not authorized to update this music' });
		}

		const updateMusicQuery = `UPDATE music SET title = $1, album_name = $2, genre = $3 WHERE id = $4 RETURNING *`;
		const musicResult = await client.query(updateMusicQuery, [title, album_name, genre, id]);
		res.json({ message: 'Music updated successfully', data: musicResult.rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to update music' });
	} finally {
		client.release();
	}

}

const deleteMusic = async (req, res) => {
	const { id } = req.params;
	const client = await pool.connect();

	try {
		const existingMusic = await musicExists(id);

		if (!existingMusic) {
			return res.status(404).json({ message: 'Music not found' });
		}

		const musicBelongsArtist = await musicBelongsToArtist(existingMusic.artist_id, req.user.userId);
		if (!musicBelongsArtist) {
			return res.status(403).json({ message: 'You are not authorized to delete this music' });
		}

		const deleteMusicQuery = `DELETE FROM music WHERE id = $1 RETURNING *`;
		const musicResult = await client.query(deleteMusicQuery, [id]);
		res.json({ message: 'Music deleted successfully', data: musicResult.rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to delete music' });
	} finally {
		client.release();
	}
}

module.exports = {
	createMusic,
	getMusic,
	getMusicByArtist,
	updateMusic,
	deleteMusic
};

