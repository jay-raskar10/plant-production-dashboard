import { API_CONFIG, ENDPOINTS } from '../config/config.js';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Base fetch wrapper with timeout and error handling
 */
const fetchWithTimeout = async (url, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new ApiError(
                `HTTP ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        return response;
    } catch (error) {
        clearTimeout(timeout);

        if (error.name === 'AbortError') {
            throw new ApiError('Request timeout', 408);
        }

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(error.message || 'Network error', 0);
    }
};

/**
 * Retry logic with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1 || error.status === 404) {
                throw error;
            }

            const backoffDelay = delay * Math.pow(2, i);
            console.log(`Retry ${i + 1}/${maxRetries} after ${backoffDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
    }
};

/**
 * API Service
 */
export const apiService = {
    /**
     * Get metadata for dropdowns (plants, lines, stations, shifts)
     */
    getMetadata: async () => {
        console.log('🔵 API: Fetching metadata...');
        return retryWithBackoff(async () => {
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.META}`;
            console.log('📡 Request URL:', url);

            const response = await fetchWithTimeout(url);
            const json = await response.json();

            console.log('✅ Metadata response:', json);

            if (!json.success) {
                console.error('❌ Metadata fetch failed:', json);
                throw new ApiError('Failed to fetch metadata', response.status, json);
            }

            return json.data;
        });
    },

    /**
     * Get line status (Production + SPC data)
     * @param {Object} filters - { plant, line, station, shift, dateRange }
     */
    getLineStatus: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.LINE_STATUS}?${params}`;

        const response = await fetchWithTimeout(url);
        const json = await response.json();

        if (!json.success) {
            throw new ApiError('Failed to fetch line status', response.status, json);
        }

        return json.data;
    },

    /**
     * Get station details for drill-down view
     * @param {string} stationId - Station ID
     * @param {Object} filters - { dateRange, shift }
     */
    getStationDetails: async (stationId, filters = {}) => {
        return retryWithBackoff(async () => {
            const params = new URLSearchParams({ id: stationId, ...filters });
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.STATION_STATUS}?${params}`;
            const response = await fetchWithTimeout(url);
            const json = await response.json();

            if (!json.success) {
                throw new ApiError('Failed to fetch station details', response.status, json);
            }

            return json.data;
        });
    },

    /**
     * Check API health
     */
    checkHealth: async () => {
        try {
            const url = `${API_CONFIG.BASE_URL}/health`;
            const response = await fetchWithTimeout(url);
            const json = await response.json();
            return json.status === 'ok';
        } catch (error) {
            return false;
        }
    }
};

export default apiService;
