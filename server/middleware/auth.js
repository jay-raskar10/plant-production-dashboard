/**
 * Authentication Middleware
 * Validates API key for all protected routes
 * 
 * Usage:
 *   app.use('/api', authenticate, apiRoutes);
 * 
 * Client must send API key in header:
 *   X-API-Key: your-api-key-here
 */

import dotenv from 'dotenv';
import { logAuthFailure } from '../config/logger.js';

dotenv.config();

/**
 * Authenticate API requests using API key
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function authenticate(req, res, next) {
    // Check if authentication is globally disabled for testing
    if (process.env.AUTH_DISABLED === 'true') {
        console.warn(`🕒 [TEST MODE] Skipping authentication for ${req.method} ${req.originalUrl}`);
        return next();
    }

    // Get API key from request header
    const apiKey = req.headers['x-api-key'];

    // Check if API key is provided
    if (!apiKey) {
        logAuthFailure(req, 'Missing API key');
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
            message: 'API key is missing. Please provide X-API-Key header.'
        });
    }

    // Get allowed API keys from environment
    const allowedKeys = process.env.ALLOWED_API_KEYS?.split(',').map(key => key.trim()) || [];

    // Validate API key
    if (!allowedKeys.includes(apiKey)) {
        logAuthFailure(req, 'Invalid API key');
        return res.status(403).json({
            success: false,
            error: 'Invalid API key',
            message: 'The provided API key is not authorized.'
        });
    }

    // API key is valid, proceed to next middleware
    next();
}

/**
 * Optional authentication - allows requests with or without API key
 * Useful for endpoints that have different behavior for authenticated users
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function optionalAuthenticate(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if (apiKey) {
        const allowedKeys = process.env.ALLOWED_API_KEYS?.split(',').map(key => key.trim()) || [];
        req.isAuthenticated = allowedKeys.includes(apiKey);
    } else {
        req.isAuthenticated = false;
    }

    next();
}

/**
 * Generate a new secure API key
 * Usage: node -e "import('./middleware/auth.js').then(m => console.log(m.generateApiKey()))"
 * 
 * @returns {string} - 64-character hexadecimal API key
 */
export async function generateApiKey() {
    const crypto = await import('crypto');
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate environment variables on server startup
 * Call this in server.js before starting the server
 */
export function validateAuthConfig() {
    const requiredVars = ['API_KEY', 'ALLOWED_API_KEYS'];
    const missing = [];

    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    });

    if (missing.length > 0) {
        console.error('❌ Authentication configuration error!');
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        console.error('Please check your .env file and ensure all required variables are set.');
        process.exit(1);
    }

    console.log('✅ Authentication configuration validated');
}
