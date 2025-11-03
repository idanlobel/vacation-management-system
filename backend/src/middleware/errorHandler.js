/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err);

    // Default error
    let error = {
        success: false,
        message: err.message || 'Internal Server Error',
        status: err.status || 500
    };

    // Database connection errors
    if (err.code === 'ECONNREFUSED') {
        error.message = 'Database connection failed';
        error.status = 503;
    }

    // Database constraint violations
    if (err.code === '23505') { // Unique constraint violation
        error.message = 'Resource already exists';
        error.status = 409;
    }

    if (err.code === '23503') { // Foreign key constraint violation
        error.message = 'Referenced resource not found';
        error.status = 400;
    }

    if (err.code === '23502') { // Not null constraint violation
        error.message = 'Required field is missing';
        error.status = 400;
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        error.message = 'Validation failed';
        error.status = 400;
        error.details = err.details;
    }

    // Cast errors (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
        error.message = 'Invalid resource ID';
        error.status = 400;
    }

    // JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        error.message = 'Invalid JSON format';
        error.status = 400;
    }

    // Send error response
    res.status(error.status).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: error.details
        })
    });
};

/**
 * 404 Not Found middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
};

module.exports = {
    errorHandler,
    notFound
};