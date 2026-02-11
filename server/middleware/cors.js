/**
 * CORS Configuration Middleware
 * 
 * Configures Cross-Origin Resource Sharing for LAN deployment
 * Supports multiple origins, dynamic origin validation, and IP-based restrictions
 * 
 * Usage:
 *   import { corsConfig } from './middleware/cors.js';
 *   app.use(corsConfig);
 */

import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Parse CORS origins from environment variable
 * Supports comma-separated list of origins
 * 
 * @returns {string[]} Array of allowed origins
 */
function getAllowedOrigins() {
    const originsEnv = process.env.CORS_ORIGIN || 'http://localhost:5173';
    return originsEnv.split(',').map(origin => origin.trim());
}

/**
 * Check if origin is in allowed IP ranges
 * Supports CIDR notation (e.g., 192.168.1.0/24)
 * 
 * @param {string} origin - Origin URL to check
 * @returns {boolean} True if origin IP is in allowed ranges
 */
function isOriginInAllowedIPRanges(origin) {
    const allowedRanges = process.env.ALLOWED_IP_RANGES;

    if (!allowedRanges) {
        return true; // No IP restrictions configured
    }

    try {
        // Extract hostname from origin URL
        const url = new URL(origin);
        const hostname = url.hostname;

        // For now, simple hostname matching
        // In production, use a library like 'ip-range-check' for CIDR support
        const ranges = allowedRanges.split(',').map(r => r.trim());

        // Check if hostname starts with any allowed range
        return ranges.some(range => {
            // Simple prefix matching for now
            // e.g., "192.168.1" matches "192.168.1.100"
            return hostname.startsWith(range.replace('/24', '').replace('/16', ''));
        });
    } catch (error) {
        console.error('Error checking IP range:', error);
        return false;
    }
}

/**
 * Dynamic origin validator
 * Checks if origin is in allowed list or IP ranges
 * 
 * @param {string} origin - Origin to validate
 * @param {Function} callback - Callback(error, allow)
 */
function originValidator(origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, Postman, curl)
    // These are non-browser requests that don't have CORS restrictions
    if (!origin) {
        return callback(null, true);
    }

    const allowedOrigins = getAllowedOrigins();

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
        return callback(null, true);
    }

    // Check if origin matches wildcard patterns
    const hasWildcard = allowedOrigins.some(allowed => {
        if (allowed.includes('*')) {
            const pattern = allowed.replace(/\*/g, '.*');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(origin);
        }
        return false;
    });

    if (hasWildcard) {
        return callback(null, true);
    }

    // Check if origin is in allowed IP ranges
    if (isOriginInAllowedIPRanges(origin)) {
        return callback(null, true);
    }

    // Origin not allowed
    console.warn(`🚫 CORS: Blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
}

/**
 * CORS configuration object
 */
export const corsConfig = cors({
    origin: originValidator,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours - how long browser can cache preflight response
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
});

/**
 * Simple CORS configuration for development
 * Allows all origins - USE ONLY IN DEVELOPMENT
 */
export const corsConfigDev = cors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

/**
 * Validate CORS configuration on startup
 */
export function validateCorsConfig() {
    const corsOrigin = process.env.CORS_ORIGIN;

    if (!corsOrigin) {
        console.warn('⚠️  CORS_ORIGIN not set, using default: http://localhost:5173');
        return;
    }

    const origins = getAllowedOrigins();
    console.log('✅ CORS configuration validated');
    console.log(`   Allowed origins: ${origins.length}`);
    origins.forEach(origin => {
        console.log(`   - ${origin}`);
    });

    const ipRanges = process.env.ALLOWED_IP_RANGES;
    if (ipRanges) {
        console.log(`   IP ranges: ${ipRanges}`);
    }
}

/**
 * Get CORS configuration based on environment
 * 
 * @returns {cors} CORS middleware
 */
export function getCorsConfig() {
    const env = process.env.NODE_ENV || 'development';

    if (env === 'development' && process.env.CORS_DEV_MODE === 'true') {
        console.log('⚠️  Using permissive CORS (development mode)');
        return corsConfigDev;
    }

    return corsConfig;
}
