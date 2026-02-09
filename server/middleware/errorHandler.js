import { HTTP_STATUS, ERROR_CODES } from '../utils/constants.js';

/**
 * Centralized error handling middleware
 */
export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Default error
    let statusCode = HTTP_STATUS.INTERNAL_ERROR;
    let errorCode = ERROR_CODES.QUERY_FAILED;
    let message = 'An unexpected error occurred';

    // Database connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ESOCKET') {
        errorCode = ERROR_CODES.DB_CONNECTION;
        message = 'Failed to connect to database';
    }

    // SQL errors
    else if (err.name === 'RequestError') {
        message = 'Database query failed';
    }

    // Validation errors
    else if (err.name === 'ValidationError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        errorCode = ERROR_CODES.VALIDATION_ERROR;
        message = err.message;
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message: message,
            ...(process.env.NODE_ENV === 'development' && {
                details: err.message,
                stack: err.stack
            })
        },
        timestamp: new Date().toISOString()
    });
}

/**
 * 404 handler
 */
export function notFoundHandler(req, res) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
            code: ERROR_CODES.NOT_FOUND,
            message: `Route ${req.method} ${req.path} not found`
        },
        timestamp: new Date().toISOString()
    });
}
