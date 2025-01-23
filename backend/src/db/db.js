const { Pool } = require('pg');
const dbData = require('../config/dbConfig');

const pool = new Pool({
	user: dbData.user,
	host: dbData.host,
	database: dbData.database,
	password: dbData.password,
	port: dbData.port,
});

module.exports = pool;