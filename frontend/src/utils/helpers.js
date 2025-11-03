import { format, parseISO, isValid, differenceInDays } from 'date-fns'

/**
 * Format date string for display
 * @param {string} dateString - ISO date string
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date
 */
export function formatDate(dateString, formatStr = 'MMM d, yyyy') {
    if (!dateString) return ''

    try {
        const date = parseISO(dateString)
        if (!isValid(date)) return dateString
        return format(date, formatStr)
    } catch (error) {
        console.error('Error formatting date:', error)
        return dateString
    }
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} Date in YYYY-MM-DD format
 */
export function formatDateForInput(date) {
    if (!date) return ''

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date
        if (!isValid(dateObj)) return ''
        return format(dateObj, 'yyyy-MM-dd')
    } catch (error) {
        console.error('Error formatting date for input:', error)
        return ''
    }
}

/**
 * Calculate duration between two dates
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {number} Number of days
 */
export function calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return 0

    try {
        const start = parseISO(startDate)
        const end = parseISO(endDate)
        if (!isValid(start) || !isValid(end)) return 0
        return differenceInDays(end, start) + 1 // Include both start and end days
    } catch (error) {
        console.error('Error calculating duration:', error)
        return 0
    }
}

/**
 * Get status badge class
 * @param {string} status - Request status
 * @returns {string} CSS class name
 */
export function getStatusBadgeClass(status) {
    const statusClasses = {
        pending: 'badge-pending',
        approved: 'badge-approved',
        rejected: 'badge-rejected'
    }
    return statusClasses[status?.toLowerCase()] || 'badge-pending'
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Check if date is in the future
 * @param {string} dateString - Date string to check
 * @returns {boolean} True if date is in the future
 */
export function isFutureDate(dateString) {
    if (!dateString) return false

    try {
        const date = parseISO(dateString)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date >= today
    } catch (error) {
        return false
    }
}

/**
 * Validate date range
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {object} Validation result with isValid and message
 */
export function validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
        return { isValid: false, message: 'Both start and end dates are required' }
    }

    try {
        const start = parseISO(startDate)
        const end = parseISO(endDate)

        if (!isValid(start) || !isValid(end)) {
            return { isValid: false, message: 'Invalid date format' }
        }

        if (start >= end) {
            return { isValid: false, message: 'Start date must be before end date' }
        }

        if (!isFutureDate(startDate)) {
            return { isValid: false, message: 'Start date must be in the future' }
        }

        return { isValid: true, message: '' }
    } catch (error) {
        return { isValid: false, message: 'Error validating dates' }
    }
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
    return Math.random().toString(36).substr(2, 9)
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        return false
    }
}

/**
 * Handle API errors consistently
 * @param {object} error - Error object from API
 * @returns {string} User-friendly error message
 */
export function handleApiError(error) {
    if (error.message) {
        return error.message
    }

    switch (error.status) {
        case 400:
            return 'Invalid request. Please check your input.'
        case 401:
            return 'You are not authorized to perform this action.'
        case 403:
            return 'Access denied.'
        case 404:
            return 'The requested resource was not found.'
        case 409:
            return 'This resource already exists or conflicts with existing data.'
        case 500:
            return 'Server error. Please try again later.'
        default:
            return 'An unexpected error occurred. Please try again.'
    }
}