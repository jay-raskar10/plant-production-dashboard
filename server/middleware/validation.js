import { STATIONS, PARAMETERS, SHIFTS } from '../utils/constants.js';

/**
 * Validate station parameter
 */
export function validateStation(req, res, next) {
    const { station } = req.query;

    if (station && !STATIONS.includes(station)) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: `Invalid station. Must be one of: ${STATIONS.join(', ')}`
            }
        });
    }

    next();
}

/**
 * Validate parameter for a given station
 */
export function validateParameter(req, res, next) {
    const { station, parameter } = req.query;

    if (!station) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Station is required'
            }
        });
    }

    if (!parameter) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Parameter is required'
            }
        });
    }

    if (!PARAMETERS[station] || !PARAMETERS[station].includes(parameter)) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: `Invalid parameter for ${station}. Must be one of: ${PARAMETERS[station]?.join(', ') || 'none'}`
            }
        });
    }

    next();
}

/**
 * Validate date parameter
 */
export function validateDate(req, res, next) {
    const { date, startDate, endDate } = req.query;

    const dates = [date, startDate, endDate].filter(Boolean);

    for (const d of dates) {
        if (isNaN(Date.parse(d))) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: `Invalid date format: ${d}. Use ISO 8601 format (YYYY-MM-DD)`
                }
            });
        }
    }

    next();
}

/**
 * Validate shift parameter
 */
export function validateShift(req, res, next) {
    const { shift } = req.query;

    if (shift && !SHIFTS.includes(shift)) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: `Invalid shift. Must be one of: ${SHIFTS.join(', ')}`
            }
        });
    }

    next();
}
