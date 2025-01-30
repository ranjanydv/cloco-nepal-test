const express = require('express');
const router = express.Router();
const uploadController = require('../../controllers/upload');
const { authMiddleware, authorizeRoles } = require('../../middleware/auth');


router.post('/', authMiddleware, uploadController.uploadCsv);


module.exports = router;
