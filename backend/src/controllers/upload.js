const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadsDir);
	},
	filename: function (req, file, cb) {
		// Sanitize filename and ensure CSV extension
		const timestamp = Date.now();
		const originalName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '_');
		cb(null, `${originalName}_${timestamp}.csv`);
	},
});

// File filter to only allow CSV files
const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
		cb(null, true);
	} else {
		cb(new Error('Only CSV files are allowed'), false);
	}
};

const upload = multer({ 
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024 // 5MB limit
	}
}).single('file');

const uploadCsv = (req, res) => {
	upload(req, res, function(err) {
		if (err instanceof multer.MulterError) {
			return res.status(400).json({ message: "File upload error", error: err.message });
		} else if (err) {
			return res.status(400).json({ message: err.message });
		}

		if (!req.file) {
			return res.status(400).json({ message: "No file uploaded" });
		}

		res.status(200).json({
			message: "File uploaded successfully",
			filePath: req.file.filename
		});
	});
};

module.exports = {
	uploadCsv
};
