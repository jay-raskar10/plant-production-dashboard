import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/api.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'API server is running'
    });
});

// API Routes
app.use('/api', apiRoutes);  // Mock data API routes

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
    console.log('║  Plant Production Dashboard API Server     ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📊 API URL: http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`\n📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📂 Database: ${process.env.DB_NAME || 'MES_Production'}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});
