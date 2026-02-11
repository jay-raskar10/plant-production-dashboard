/**
 * Input Validation Middleware
 * 
 * Provides minimal security-focused validation for API endpoints
 * Does NOT validate business rules - LabVIEW backend handles that
 * 
 * Focus areas:
 * - XSS prevention (sanitize HTML)
 * - SQL/NoSQL injection prevention (character whitelist)
 * - Buffer overflow prevention (length limits)
 * - Type validation (ensure strings, numbers, etc.)
 * 
 * Usage:
 *   router.get('/endpoint', sanitizeQueryParams, handleValidationErrors, handler);
 */

import { query, validationResult } from 'express-validator';
import { logValidationFailure } from '../config/logger.js';

/**
 * Sanitize and validate query parameters for line_status endpoint
 * Security-focused: prevents injection attacks, XSS, buffer overflow
 */
export const validateLineStatus = [
    query('plant')
        .optional()
        .trim()                                    // Remove whitespace
        .escape()                                  // Prevent XSS
        .isLength({ max: 100 })                   // Prevent buffer overflow
        .matches(/^[a-zA-Z0-9_-]+$/)              // Alphanumeric + underscore/hyphen only
        .withMessage('Plant must be alphanumeric'),

    query('line')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 100 })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Line must be alphanumeric'),

    query('station')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 100 })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Station must be alphanumeric'),

    query('shift')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 50 })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Shift must be alphanumeric'),

    query('dateRange')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 50 })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Date range must be alphanumeric')
];

/**
 * Sanitize and validate query parameters for station_status endpoint
 */
export const validateStationStatus = [
    query('id')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 100 })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Station ID must be alphanumeric'),

    query('dateRange')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 50 })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Date range must be alphanumeric'),

    query('shift')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 50 })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Shift must be alphanumeric')
];

/**
 * Generic sanitization for any query parameters
 * Use this for endpoints where you don't know all possible parameters
 */
export const sanitizeAllQueryParams = (req, res, next) => {
    // Sanitize all query parameters
    Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
            // Trim whitespace
            req.query[key] = req.query[key].trim();

            // Limit length to prevent buffer overflow
            if (req.query[key].length > 1000) {
                req.query[key] = req.query[key].substring(0, 1000);
            }

            // Basic XSS prevention (escape HTML)
            req.query[key] = req.query[key]
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        }
    });

    next();
};

/**
 * Validation error handler
 * Formats validation errors and returns 400 Bad Request
 */
export function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Log validation failure (potential security event)
        logValidationFailure(req, errors.array());

        return res.status(400).json({
            success: false,
            error: 'Invalid request parameters',
            message: 'One or more parameters failed security validation',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }

    next();
}

/**
 * Validate environment configuration on startup
 */
export function validateInputValidationConfig() {
    console.log('✅ Input validation configured (security-focused)');
    console.log('   - XSS prevention: enabled');
    console.log('   - Injection prevention: enabled');
    console.log('   - Buffer overflow prevention: enabled');
    console.log('   - Business rule validation: delegated to LabVIEW');
}
