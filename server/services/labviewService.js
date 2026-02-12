import dotenv from 'dotenv';
import { logError } from '../config/logger.js';

dotenv.config();

const LABVIEW_URL = process.env.LABVIEW_API_URL || 'http://localhost:8080';
const TIMEOUT = parseInt(process.env.LABVIEW_API_TIMEOUT) || 5000;

/**
 * LabVIEW API Service
 * Handles communication with the LabVIEW Web Services using native fetch
 */
class LabviewService {
    constructor() {
        // Construct base URL ensuring no trailing slash to avoid double slashes
        this.baseURL = LABVIEW_URL.endsWith('/') ? LABVIEW_URL.slice(0, -1) : LABVIEW_URL;
        console.log(`📡 LabviewService initialized with URL: ${this.baseURL}`);
    }

    /**
     * Generic request handler using native fetch
     * @private
     */
    async _request(endpoint, options = {}) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), TIMEOUT);

        const { params, ...fetchOptions } = options;

        let url = `${this.baseURL}${endpoint}`;
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, value);
                }
            });
            url += `?${searchParams.toString()}`;
        }

        console.log(`📡 [LabviewService] Calling: ${url}`);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...fetchOptions.headers
                },
                signal: controller.signal
            });

            clearTimeout(id);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error(`Request timed out after ${TIMEOUT}ms`);
            }
            throw error;
        }
    }

    /**
     * Get Line Status from LabVIEW
     * @param {Object} filters - plant, line, station, shift, dateRange
     */
    async getLineStatus(filters) {
        try {
            return await this._request('/api/line_status', { params: filters });
        } catch (error) {
            logError(error, { context: 'LabviewService.getLineStatus', filters });
            throw new Error(`Failed to fetch from LabVIEW: ${error.message}`);
        }
    }

    /**
     * Get Station Details from LabVIEW
     * @param {string} stationId 
     */
    async getStationDetails(stationId) {
        try {
            return await this._request('/api/station_status', { params: { id: stationId } });
        } catch (error) {
            logError(error, { context: 'LabviewService.getStationDetails', stationId });
            throw new Error(`Failed to fetch station details from LabVIEW: ${error.message}`);
        }
    }

    /**
     * Get Metadata from LabVIEW
     */
    async getMetadata() {
        try {
            return await this._request('/api/meta');
        } catch (error) {
            logError(error, { context: 'LabviewService.getMetadata' });
            throw new Error(`Failed to fetch metadata from LabVIEW: ${error.message}`);
        }
    }
}

export const labviewService = new LabviewService();
