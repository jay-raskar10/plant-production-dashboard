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

    // Add API key to headers
    const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_API_KEY,
        ...options.headers
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
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
        return retryWithBackoff(async () => {
            const params = new URLSearchParams(filters);
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.LINE_STATUS}?${params}`;

            const response = await fetchWithTimeout(url);
            const json = await response.json();

            if (!json.success) {
                throw new ApiError('Failed to fetch line status', response.status, json);
            }

            return json.data;
        });
    },

    /**
     * Get station details for drill-down view
     * @param {string} stationId - Station ID
     * @param {Object} filters - { dateRange, shift }
     */
    getStationDetails: async (stationId, filters = {}) => {
        return retryWithBackoff(async () => {
            const params = new URLSearchParams({ id: stationId, ...filters });
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.STATION_DETAILS}?${params}`;
            const response = await fetchWithTimeout(url);
            const json = await response.json();

            if (!json.success) {
                throw new ApiError('Failed to fetch station details', response.status, json);
            }

            return json.data;
        });
    },

    /**
     * Get SPC data (extracted from line_status endpoint)
     * @param {Object} filters - { plant, line, station, shift, dateRange, parameter }
     */
    getSPCData: async (filters = {}) => {
        return retryWithBackoff(async () => {
            const params = new URLSearchParams(filters);
            const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.LINE_STATUS}?${params}`;
            console.log('📡 Fetching SPC:', url);

            const response = await fetchWithTimeout(url);
            const json = await response.json();

            if (!json.success) {
                throw new ApiError('Failed to fetch SPC data', response.status, json);
            }

            // SPC data is nested inside the line_status response
            return json.data;
        });
    },

    /**
     * Export Report — triggers a download from the backend
     * @param {Object} filters - { plant, line, station, shift, dateRange }
     * @param {string} reportType - 'graph' | 'table' | 'spc'
     */
    exportReport: async (filters = {}, reportType = 'table') => {
        const params = new URLSearchParams({ ...filters, reportType });
        const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.EXPORT}?${params}`;
        console.log('📥 Export request:', url);

        const response = await fetchWithTimeout(url);
        const contentType = response.headers.get('content-type');

        // If the response is JSON, it means mock mode or an error
        if (contentType && contentType.includes('application/json')) {
            const json = await response.json();
            return { success: false, message: json.message || 'Export not available' };
        }

        // Otherwise, trigger file download
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;

        // Try to get filename from Content-Disposition header
        const disposition = response.headers.get('content-disposition');
        let filename = `report_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        if (disposition) {
            const match = disposition.match(/filename="?(.+)"?/);
            if (match) filename = match[1];
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

        return { success: true, message: 'Download started' };
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
