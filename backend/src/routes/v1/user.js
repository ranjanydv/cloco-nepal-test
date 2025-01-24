const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user');
const authMiddleware = require('../../middleware/auth');


router.get('/', authMiddleware, userController.getUsers);
router.get('/:id', authMiddleware, userController.getSingleUser);


module.exports = router;
