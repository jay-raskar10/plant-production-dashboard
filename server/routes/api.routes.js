import express from 'express';
import {
    generateMetadata,
    generateLineStatus,
    generateStationDetails
} from '../utils/mockDataGenerator.js';
import { labviewService } from '../services/labviewService.js';
import {
    validateLineStatus,
    validateStationStatus,
    handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

const USE_MOCK = process.env.USE_MOCK_DATA.trim() === 'true';

/**
 * GET /api/meta
 * Get metadata for all dropdowns (plants, lines, stations, shifts)
 * This should be fetched once on app load
 */
router.get('/meta', async (req, res) => {
    try {
        const metadata = USE_MOCK ? generateMetadata() : await labviewService.getMetadata();

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
router.get('/line_status', validateLineStatus, handleValidationErrors, async (req, res) => {
    try {
        const filters = {
            plant: req.query.plant || 'pune',
            line: req.query.line || 'fcpv',
            station: req.query.station || 'all',
            shift: req.query.shift || 'all',
            dateRange: req.query.dateRange || 'today',
            resolution: req.query.resolution || 'raw',
            startDate: req.query.startDate || null,
            endDate: req.query.endDate || null
        };

        const lineStatus = USE_MOCK ? generateLineStatus(filters) : await labviewService.getLineStatus(filters);

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
router.get('/station_status', validateStationStatus, handleValidationErrors, async (req, res) => {
    try {
        const stationId = req.query.id || 'op10';
        const dateRange = req.query.dateRange || 'today';
        const shift = req.query.shift || 'all';

        const stationDetails = USE_MOCK ? generateStationDetails(stationId) : await labviewService.getStationDetails(stationId);

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

/**
 * GET /api/export
 * Request an Excel report from LabVIEW based on current filters and view mode
 * Query params: plant, line, station, shift, dateRange, reportType (graph|table|spc)
 */
router.get('/export', async (req, res) => {
    try {
        const filters = {
            plant: req.query.plant || 'pune',
            line: req.query.line || 'fcpv',
            station: req.query.station || 'all',
            shift: req.query.shift || 'all',
            dateRange: req.query.dateRange || 'today'
        };
        const reportType = req.query.reportType || 'table';

        if (USE_MOCK) {
            // In mock mode, LabVIEW isn't available — return a placeholder response
            return res.status(200).json({
                success: false,
                message: 'Export is not available in mock mode. Connect to LabVIEW to generate reports.',
                filters,
                reportType,
                timestamp: new Date().toISOString()
            });
        }

        // Proxy to LabVIEW — stream the file back to the client
        const labviewResponse = await labviewService.exportReport(filters, reportType);

        // Forward LabVIEW response headers
        const contentType = labviewResponse.headers.get('content-type');
        const contentDisposition = labviewResponse.headers.get('content-disposition');

        res.setHeader('Content-Type', contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        if (contentDisposition) {
            res.setHeader('Content-Disposition', contentDisposition);
        } else {
            const filename = `report_${reportType}_${filters.line}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        }

        // Stream the file body
        const arrayBuffer = await labviewResponse.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
