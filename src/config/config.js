/**
 * API Configuration
 */
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    POLLING_INTERVAL: parseInt(import.meta.env.VITE_POLLING_INTERVAL) || 5000
};

export const ENDPOINTS = {
    META: '/api/meta',
    LINE_STATUS: '/api/line_status',
    STATION_STATUS: '/api/station_status'
};

// Debug: Log configuration on load
console.log('🔧 API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    TIMEOUT: API_CONFIG.TIMEOUT,
    POLLING_INTERVAL: API_CONFIG.POLLING_INTERVAL
});
