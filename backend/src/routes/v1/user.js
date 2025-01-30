const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user');
const { authMiddleware, authorizeRoles } = require('../../middleware/auth');


router.get('/', authMiddleware, userController.getUsers);
router.get('/managers', authMiddleware, userController.getAllManagers);
router.get('/:id', authMiddleware, userController.getSingleUser);
router.patch('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, authorizeRoles(['super_admin']), userController.deleteUser);


module.exports = router;
