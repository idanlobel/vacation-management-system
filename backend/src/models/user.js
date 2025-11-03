const db = require('../db');

class User {
    /**
     * Get all users
     * @returns {Promise<Array>} Array of users
     */
    static async findAll() {
        return db('users').select('*').orderBy('name');
    }

    /**
     * Get user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User object or null
     */
    static async findById(id) {
        const user = await db('users').where({ id }).first();
        return user || null;
    }

    /**
     * Get user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User object or null
     */
    static async findByEmail(email) {
        const user = await db('users').where({ email }).first();
        return user || null;
    }

    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Created user
     */
    static async create(userData) {
        const [user] = await db('users').insert(userData).returning('*');
        return user;
    }

    /**
     * Update user by ID
     * @param {number} id - User ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object|null>} Updated user or null
     */
    static async update(id, updates) {
        const [user] = await db('users')
            .where({ id })
            .update({ ...updates, updated_at: new Date() })
            .returning('*');
        return user || null;
    }

    /**
     * Delete user by ID
     * @param {number} id - User ID
     * @returns {Promise<boolean>} True if deleted, false otherwise
     */
    static async delete(id) {
        const deletedRows = await db('users').where({ id }).del();
        return deletedRows > 0;
    }

    /**
     * Get users by role
     * @param {string} role - User role (requester/validator)
     * @returns {Promise<Array>} Array of users with specified role
     */
    static async findByRole(role) {
        return db('users').where({ role }).select('*').orderBy('name');
    }
}

module.exports = User;