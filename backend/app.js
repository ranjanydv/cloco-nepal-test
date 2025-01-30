const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const v1Routes = require('./src/routes/v1/');
const fs = require("fs");
const path = require("path");

const app = express();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

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