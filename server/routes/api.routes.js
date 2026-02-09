import express from 'express';
import {
    generateMetadata,
    generateLineStatus,
    generateStationDetails
} from '../utils/mockDataGenerator.js';

const router = express.Router();

/**
 * GET /api/meta
 * Get metadata for all dropdowns (plants, lines, stations, shifts)
 * This should be fetched once on app load
 */
router.get('/meta', async (req, res) => {
    try {
        const metadata = generateMetadata();

        res.json({
            success: true,
            data: metadata,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/line_status
 * Get complete line status including Production KPIs and SPC data
 * Query params: plant, line, station, shift, dateRange
 */
router.get('/line_status', async (req, res) => {
    try {
        const filters = {
            plant: req.query.plant || 'pune',
            line: req.query.line || 'fcpv',
            station: req.query.station || 'all',
            shift: req.query.shift || 'all',
            dateRange: req.query.dateRange || 'today'
        };

        const lineStatus = generateLineStatus(filters);

        res.json({
            success: true,
            filters,
            data: lineStatus,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/station_status
 * Get detailed station analytics for drill-down view
 * Query params: id (station ID), dateRange, shift
 */
router.get('/station_status', async (req, res) => {
    try {
        const stationId = req.query.id || 'op10';
        const dateRange = req.query.dateRange || 'today';
        const shift = req.query.shift || 'all';

        const stationDetails = generateStationDetails(stationId);

        res.json({
            success: true,
            station: stationId,
            filters: { dateRange, shift },
            data: stationDetails,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
