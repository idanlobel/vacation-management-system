const { validationResult } = require('express-validator');
const VacationRequest = require('../models/VacationRequest');
const User = require('../models/User');

class VacationRequestsController {
    /**
     * Get all vacation requests (for validators)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getAllRequests(req, res) {
        try {
            const { status } = req.query;
            let requests;

            if (status) {
                // Validate status parameter
                if (!['pending', 'approved', 'rejected'].includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid status. Must be "pending", "approved", or "rejected"'
                    });
                }
                requests = await VacationRequest.findByStatus(status);
            } else {
                requests = await VacationRequest.findAll();
            }

            res.json({
                success: true,
                data: requests
            });
        } catch (error) {
            console.error('Error fetching vacation requests:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Get vacation requests by user ID (for requesters)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getRequestsByUserId(req, res) {
        try {
            const { userId } = req.params;

            // Check if user exists
            const user = await User.findById(parseInt(userId));
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const requests = await VacationRequest.findByUserId(parseInt(userId));
            res.json({
                success: true,
                data: requests
            });
        } catch (error) {
            console.error('Error fetching user vacation requests:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Get vacation request by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async getRequestById(req, res) {
        try {
            const { id } = req.params;
            const request = await VacationRequest.findById(parseInt(id));

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Vacation request not found'
                });
            }

            res.json({
                success: true,
                data: request
            });
        } catch (error) {
            console.error('Error fetching vacation request:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Create a new vacation request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async createRequest(req, res) {
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

            const { user_id, start_date, end_date, reason } = req.body;

            // Check if user exists
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if start date is before end date
            if (new Date(start_date) >= new Date(end_date)) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date must be before end date'
                });
            }

            // Check if start date is in the future
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (new Date(start_date) < today) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date must be in the future'
                });
            }

            // Check for overlapping requests
            const overlappingRequests = await VacationRequest.findOverlapping(
                user_id,
                start_date,
                end_date
            );

            if (overlappingRequests.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'You already have a vacation request for overlapping dates',
                    overlapping_requests: overlappingRequests
                });
            }

            const requestData = {
                user_id,
                start_date,
                end_date,
                reason: reason || null,
                status: 'pending'
            };

            const request = await VacationRequest.create(requestData);
            res.status(201).json({
                success: true,
                message: 'Vacation request created successfully',
                data: request
            });
        } catch (error) {
            console.error('Error creating vacation request:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Approve a vacation request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async approveRequest(req, res) {
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
            const { validator_id, comments } = req.body;

            // Check if request exists
            const existingRequest = await VacationRequest.findById(parseInt(id));
            if (!existingRequest) {
                return res.status(404).json({
                    success: false,
                    message: 'Vacation request not found'
                });
            }

            // Check if request is still pending
            if (existingRequest.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Only pending requests can be approved'
                });
            }

            // Check if validator exists and has validator role
            const validator = await User.findById(validator_id);
            if (!validator || validator.role !== 'validator') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid validator'
                });
            }

            const request = await VacationRequest.updateStatus(
                parseInt(id),
                'approved',
                validator_id,
                comments
            );

            res.json({
                success: true,
                message: 'Vacation request approved successfully',
                data: request
            });
        } catch (error) {
            console.error('Error approving vacation request:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Reject a vacation request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async rejectRequest(req, res) {
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
            const { validator_id, comments } = req.body;

            // Check if request exists
            const existingRequest = await VacationRequest.findById(parseInt(id));
            if (!existingRequest) {
                return res.status(404).json({
                    success: false,
                    message: 'Vacation request not found'
                });
            }

            // Check if request is still pending
            if (existingRequest.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Only pending requests can be rejected'
                });
            }

            // Check if validator exists and has validator role
            const validator = await User.findById(validator_id);
            if (!validator || validator.role !== 'validator') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid validator'
                });
            }

            const request = await VacationRequest.updateStatus(
                parseInt(id),
                'rejected',
                validator_id,
                comments
            );

            res.json({
                success: true,
                message: 'Vacation request rejected successfully',
                data: request
            });
        } catch (error) {
            console.error('Error rejecting vacation request:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * Delete a vacation request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async deleteRequest(req, res) {
        try {
            const { id } = req.params;

            // Check if request exists
            const existingRequest = await VacationRequest.findById(parseInt(id));
            if (!existingRequest) {
                return res.status(404).json({
                    success: false,
                    message: 'Vacation request not found'
                });
            }

            // Only allow deletion of pending requests
            if (existingRequest.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Only pending requests can be deleted'
                });
            }

            const deleted = await VacationRequest.delete(parseInt(id));
            if (deleted) {
                res.json({
                    success: true,
                    message: 'Vacation request deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete vacation request'
                });
            }
        } catch (error) {
            console.error('Error deleting vacation request:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = VacationRequestsController;