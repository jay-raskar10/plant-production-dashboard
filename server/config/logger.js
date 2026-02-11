/**
 * Logging Configuration
 * 
 * Error-only logging strategy for high-frequency polling dashboard
 * Logs errors, warnings, and security events - skips successful requests
 * 
 * Why error-only?
 * - Dashboard polls every 3 seconds (1,200 requests/hour)
 * - Logging every request = massive log files + performance impact
 * - Only need to know when things break or security events occur
 * 
 * What we log:
 * ✅ Errors (500, 404, crashes)
 * ✅ Security events (auth failures, XSS attempts, CORS blocks)
 * ✅ Server lifecycle (startup, shutdown)
 * ❌ Successful requests (200 OK) - too noisy
 */

import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

// Log levels (Winston default):
// error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'plant-production-api' },
    transports: [
        // Console output (always enabled)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ level, message, timestamp, ...meta }) => {
                    let msg = `${timestamp} [${level}] ${message}`;

                    // Add metadata if present
                    if (Object.keys(meta).length > 0 && meta.service !== 'plant-production-api') {
                        msg += ` ${JSON.stringify(meta)}`;
                    }

                    return msg;
                })
            )
        })
    ]
});

// Add file transport if enabled in environment
if (process.env.ENABLE_FILE_LOGGING === 'true') {
    const logFilePath = process.env.LOG_FILE_PATH || './logs/app.log';

    logger.add(new winston.transports.File({
        filename: logFilePath.replace('.log', '-error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }));

    logger.add(new winston.transports.File({
        filename: logFilePath,
        level: 'warn',
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }));
}

/**
 * Request logging middleware (error-only)
 * Only logs failed requests, not successful ones
 */
export function requestLogger(req, res, next) {
    const startTime = Date.now();

    // Capture the original end function
    const originalEnd = res.end;

    // Override res.end to log after response
    res.end = function (...args) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Only log errors and warnings (not successful requests)
        if (statusCode >= 400) {
            const level = statusCode >= 500 ? 'error' : 'warn';

            logger.log(level, `${req.method} ${req.originalUrl} - ${statusCode}`, {
                method: req.method,
                url: req.originalUrl,
                statusCode,
                duration: `${duration}ms`,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent')
            });
        }

        // Call original end function
        originalEnd.apply(res, args);
    };

    next();
}

/**
 * Log server startup
 */
export function logServerStart(port) {
    logger.info(`🚀 Server started on port ${port}`, {
        port,
        environment: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'info',
        fileLogging: process.env.ENABLE_FILE_LOGGING === 'true'
    });
}

/**
 * Log authentication failures
 */
export function logAuthFailure(req, reason) {
    logger.warn(`🔒 Authentication failed: ${reason}`, {
        ip: req.ip || req.connection.remoteAddress,
        url: req.originalUrl,
        reason,
        userAgent: req.get('user-agent')
    });
}

/**
 * Log validation failures (security events)
 */
export function logValidationFailure(req, errors) {
    logger.warn(`🛡️ Validation failed - potential attack`, {
        ip: req.ip || req.connection.remoteAddress,
        url: req.originalUrl,
        errors: errors.map(e => ({
            field: e.path,
            value: e.value,
            message: e.msg
        })),
        userAgent: req.get('user-agent')
    });
}

/**
 * Log CORS blocks
 */
export function logCorsBlock(origin) {
    logger.warn(`🚫 CORS blocked origin: ${origin}`, {
        origin,
        timestamp: new Date().toISOString()
    });
}

/**
 * Log general errors
 */
export function logError(error, context = {}) {
    logger.error(`❌ ${error.message}`, {
        error: error.message,
        stack: error.stack,
        ...context
    });
}

/**
 * Validate logging configuration on startup
 */
export function validateLoggingConfig() {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const fileLogging = process.env.ENABLE_FILE_LOGGING === 'true';

    console.log('✅ Logging configured (error-only strategy)');
    console.log(`   - Log level: ${logLevel}`);
    console.log(`   - Console logging: enabled`);
    console.log(`   - File logging: ${fileLogging ? 'enabled' : 'disabled'}`);
    console.log('   - Strategy: Errors and warnings only (no successful requests)');
    console.log('   - Reason: High-frequency polling (every 3 seconds)');
}

export default logger;
