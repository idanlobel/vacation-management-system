const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/usersController');
const {
    createUserValidation,
    updateUserValidation,
    idParamValidation,
    roleParamValidation
} = require('../middleware/validation');

// GET /api/users - Get all users
router.get('/', UsersController.getAllUsers);

// GET /api/users/role/:role - Get users by role
router.get('/role/:role', roleParamValidation, UsersController.getUsersByRole);

// GET /api/users/:id - Get user by ID
router.get('/:id', idParamValidation, UsersController.getUserById);

// POST /api/users - Create a new user
router.post('/', createUserValidation, UsersController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', [...idParamValidation, ...updateUserValidation], UsersController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', idParamValidation, UsersController.deleteUser);

module.exports = router;