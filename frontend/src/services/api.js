import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add any auth tokens here if needed
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        // Handle different error types
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data.message || 'An error occurred'
            return Promise.reject({
                message: errorMessage,
                status: error.response.status,
                data: error.response.data
            })
        } else if (error.request) {
            // Request made but no response
            return Promise.reject({
                message: 'Network error - please check your connection',
                status: 0
            })
        } else {
            // Something else happened
            return Promise.reject({
                message: error.message || 'An unexpected error occurred',
                status: 0
            })
        }
    }
)

// Users API
export const usersAPI = {
    // Get all users
    getAll() {
        return api.get('/users')
    },

    // Get user by ID
    getById(id) {
        return api.get(`/users/${id}`)
    },

    // Get users by role
    getByRole(role) {
        return api.get(`/users/role/${role}`)
    },

    // Create new user
    create(userData) {
        return api.post('/users', userData)
    },

    // Update user
    update(id, userData) {
        return api.put(`/users/${id}`, userData)
    },

    // Delete user
    delete(id) {
        return api.delete(`/users/${id}`)
    }
}

// Vacation Requests API
export const vacationRequestsAPI = {
    // Get all vacation requests (for validators)
    getAll(status = null) {
        const params = status ? { status } : {}
        return api.get('/vacation-requests', { params })
    },

    // Get vacation requests by user ID (for requesters)
    getByUserId(userId) {
        return api.get(`/vacation-requests/user/${userId}`)
    },

    // Get vacation request by ID
    getById(id) {
        return api.get(`/vacation-requests/${id}`)
    },

    // Create new vacation request
    create(requestData) {
        return api.post('/vacation-requests', requestData)
    },

    // Approve vacation request
    approve(id, validatorId, comments = null) {
        return api.put(`/vacation-requests/${id}/approve`, {
            validator_id: validatorId,
            comments
        })
    },

    // Reject vacation request
    reject(id, validatorId, comments) {
        return api.put(`/vacation-requests/${id}/reject`, {
            validator_id: validatorId,
            comments
        })
    },

    // Delete vacation request
    delete(id) {
        return api.delete(`/vacation-requests/${id}`)
    }
}

export default api