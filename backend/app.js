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
		allowedHeaders: ['Content-Type', 'Authorization'],
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		origin: '*',
		credentials: true,
	})
);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cookieParser());
// Routes
app.use('/api/v1', v1Routes);

module.exports = app;