import express from 'express';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authenticate, validateAuthConfig } from './middleware/auth.js';
import { getCorsConfig, validateCorsConfig } from './middleware/cors.js';
import { validateInputValidationConfig } from './middleware/validation.js';
import { requestLogger, logServerStart, validateLoggingConfig } from './config/logger.js';
import apiRoutes from './routes/api.routes.js';

// Load environment variables
dotenv.config();

// Validate authentication configuration
validateAuthConfig();

// Validate CORS configuration
validateCorsConfig();

// Validate input validation configuration
validateInputValidationConfig();

// Validate logging configuration
validateLoggingConfig();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(getCorsConfig());  // Dynamic CORS configuration
app.use(requestLogger);    // Error-only request logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint (no authentication required)
app.get('/health', async (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'API server is running',
        authentication: 'enabled'
    });
});

// API Routes (protected with authentication)
app.use('/api', authenticate, apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Plant Production Dashboard API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            dashboard: {
                metadata: '/api/meta',
                lineStatus: '/api/line_status?plant={plant}&line={line}&station={station}&shift={shift}&dateRange={dateRange}',
                stationDetails: '/api/station_status?id={stationId}&dateRange={dateRange}&shift={shift}'
            }
        }
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   Plant Production Dashboard - Server     ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('');

    logServerStart(PORT);

    console.log('');
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
    console.log(`📡 API Endpoints: http://localhost:${PORT}/api/meta`);
    console.log('');
    console.log(`✅ Authentication: ${process.env.ALLOWED_API_KEYS ? process.env.ALLOWED_API_KEYS.split(',').length + ' key(s) configured' : 'Not configured'}`);
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});
