const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const v1Routes = require('./src/routes/v1/');

const app = express();

// CORS configuration
app.use(
	cors({
		origin: [process.env.FRONTEND_URL],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);

// Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.options('*', cors());

// Routes
app.use('/api/v1', v1Routes);

module.exports = app;