const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const pool = require('../db/db');

const register = async (req, res) => {
	const { firstName, lastName, email, password, role } = req.body;

	try {
		// Hash the password
		const hashedPassword = await argon2.hash(password);

		// Insert the new user into the database using raw SQL
		const query = `
			INSERT INTO users (first_name, last_name, email, password, role)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id;
			`;
		const values = [firstName, lastName, email.toLowerCase(), hashedPassword, role];

		const result = await pool.query(query, values);
		res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Registration failed' });
	}
};

const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const query = 'SELECT * FROM users WHERE email = $1';
		const result = await pool.query(query, [email.toLowerCase()]);

		if (result.rows.length === 0) {
			return res.status(400).json({ message: 'User not found' });
		}

		const user = result.rows[0];

		// Verify the password
		const validPassword = await argon2.verify(user.password, password);
		if (!validPassword) {
			return res.status(400).json({ message: 'Invalid password' });
		}

		const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
		const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

		// Set cookies
		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
		});

		res.json({ message: 'Login successful' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Login failed' });
	}
};


const refreshToken = async (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken) return res.status(401).json({ error: 'Access denied' });

	try {
		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

		const query = 'SELECT * FROM users WHERE id = $1';
		const result = await pool.query(query, [decoded.userId]);

		if (result.rows.length === 0) {
			return res.status(401).json({ error: 'Invalid token' });
		}

		const newAccessToken = jwt.sign({ userId: decoded.userId, role: result.rows[0].role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

		res.cookie('accessToken', newAccessToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			maxAge: 15 * 60 * 1000, // 15 minutes
		});

		res.json({ message: 'Token refreshed' });
	} catch (error) {
		res.status(401).json({ error: 'Invalid token' });
	}
};

const logout = async (req, res) => {
	try {
		// Clear cookies
		res.clearCookie('accessToken', {
			httpOnly: true,
			secure: false,
			sameSite: 'lax'
		});

		res.json({ message: 'Logged out successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Logout failed' });
	}
};

const getCurrentUser = async (req, res) => {
	const userId = req.user.userId;
	const query = 'SELECT id, first_name, last_name, email, role,created_at,updated_at FROM users WHERE id = $1';
	const result = await pool.query(query, [userId]);
	res.json(result.rows[0]);
};

module.exports = { register, login, refreshToken, logout, getCurrentUser };