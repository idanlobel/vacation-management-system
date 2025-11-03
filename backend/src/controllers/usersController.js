const { validationResult } = require('express-validator');
const User = require('../models/User');

class UsersController {
    /**
     * Get all users
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getAllUsers(req, res) {
        try {
            const users = await User.findAll();
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Get user by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(parseInt(id));

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Get users by role
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getUsersByRole(req, res) {
        try {
            const { role } = req.params;

            if (!['requester', 'validator'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role. Must be "requester" or "validator"'
                });
            }

            const users = await User.findByRole(role);
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Error fetching users by role:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Create a new user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async createUser(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const { name, email, role } = req.body;

            // Check if user with email already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            const user = await User.create({ name, email, role });
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Update user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async updateUser(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation errors',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const updates = req.body;

            // Check if user exists
            const existingUser = await User.findById(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // If email is being updated, check for conflicts
            if (updates.email && updates.email !== existingUser.email) {
                const emailUser = await User.findByEmail(updates.email);
                if (emailUser) {
                    return res.status(409).json({
                        success: false,
                        message: 'User with this email already exists'
                    });
                }
            }

            const user = await User.update(parseInt(id), updates);
            res.json({
                success: true,
                message: 'User updated successfully',
                data: user
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Delete user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Check if user exists
            const existingUser = await User.findById(parseInt(id));
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const deleted = await User.delete(parseInt(id));
            if (deleted) {
                res.json({
                    success: true,
                    message: 'User deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete user'
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = UsersController;