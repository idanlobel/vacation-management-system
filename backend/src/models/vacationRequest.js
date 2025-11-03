const db = require('../db');

class VacationRequest {
    /**
     * Get all vacation requests with user information
     * @returns {Promise<Array>} Array of vacation requests
     */
    static async findAll() {
        return db('vacation_requests')
            .join('users', 'vacation_requests.user_id', 'users.id')
            .leftJoin('users as validators', 'vacation_requests.validator_id', 'validators.id')
            .select(
                'vacation_requests.*',
                'users.name as user_name',
                'users.email as user_email',
                'validators.name as validator_name'
            )
            .orderBy('vacation_requests.created_at', 'desc');
    }

    /**
     * Get vacation request by ID
     * @param {number} id - Request ID
     * @returns {Promise<Object|null>} Vacation request or null
     */
    static async findById(id) {
        const request = await db('vacation_requests')
            .join('users', 'vacation_requests.user_id', 'users.id')
            .leftJoin('users as validators', 'vacation_requests.validator_id', 'validators.id')
            .select(
                'vacation_requests.*',
                'users.name as user_name',
                'users.email as user_email',
                'validators.name as validator_name'
            )
            .where('vacation_requests.id', id)
            .first();
        return request || null;
    }

    /**
     * Get vacation requests by user ID
     * @param {number} userId - User ID
     * @returns {Promise<Array>} Array of vacation requests for the user
     */
    static async findByUserId(userId) {
        return db('vacation_requests')
            .leftJoin('users as validators', 'vacation_requests.validator_id', 'validators.id')
            .select(
                'vacation_requests.*',
                'validators.name as validator_name'
            )
            .where('vacation_requests.user_id', userId)
            .orderBy('vacation_requests.created_at', 'desc');
    }

    /**
     * Get vacation requests by status
     * @param {string} status - Request status (pending/approved/rejected)
     * @returns {Promise<Array>} Array of vacation requests with specified status
     */
    static async findByStatus(status) {
        return db('vacation_requests')
            .join('users', 'vacation_requests.user_id', 'users.id')
            .leftJoin('users as validators', 'vacation_requests.validator_id', 'validators.id')
            .select(
                'vacation_requests.*',
                'users.name as user_name',
                'users.email as user_email',
                'validators.name as validator_name'
            )
            .where('vacation_requests.status', status)
            .orderBy('vacation_requests.created_at', 'desc');
    }

    /**
     * Create a new vacation request
     * @param {Object} requestData - Request data
     * @returns {Promise<Object>} Created vacation request
     */
    static async create(requestData) {
        const [request] = await db('vacation_requests').insert(requestData).returning('*');
        return this.findById(request.id);
    }

    /**
     * Update vacation request status
     * @param {number} id - Request ID
     * @param {string} status - New status
     * @param {number} validatorId - Validator ID
     * @param {string} comments - Optional comments
     * @returns {Promise<Object|null>} Updated vacation request or null
     */
    static async updateStatus(id, status, validatorId, comments = null) {
        const updateData = {
            status,
            validator_id: validatorId,
            updated_at: new Date()
        };

        if (comments) {
            updateData.comments = comments;
        }

        const [request] = await db('vacation_requests')
            .where({ id })
            .update(updateData)
            .returning('*');

        if (!request) return null;
        return this.findById(request.id);
    }

    /**
     * Delete vacation request
     * @param {number} id - Request ID
     * @returns {Promise<boolean>} True if deleted, false otherwise
     */
    static async delete(id) {
        const deletedRows = await db('vacation_requests').where({ id }).del();
        return deletedRows > 0;
    }

    /**
     * Check for overlapping vacation requests for a user
     * @param {number} userId - User ID
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @param {number} excludeId - Request ID to exclude from check (for updates)
     * @returns {Promise<Array>} Array of overlapping requests
     */
    static async findOverlapping(userId, startDate, endDate, excludeId = null) {
        let query = db('vacation_requests')
            .where('user_id', userId)
            .where('status', '!=', 'rejected')
            .where(function () {
                this.where(function () {
                    // Start date falls within existing request
                    this.where('start_date', '<=', startDate)
                        .where('end_date', '>=', startDate);
                })
                    .orWhere(function () {
                        // End date falls within existing request
                        this.where('start_date', '<=', endDate)
                            .where('end_date', '>=', endDate);
                    })
                    .orWhere(function () {
                        // New request encompasses existing request
                        this.where('start_date', '>=', startDate)
                            .where('end_date', '<=', endDate);
                    });
            });

        if (excludeId) {
            query = query.where('id', '!=', excludeId);
        }

        return query;
    }
}

module.exports = VacationRequest;