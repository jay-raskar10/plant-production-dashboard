/**
 * Statistical Calculation Service
 * Provides SPC (Statistical Process Control) calculations
 */

/**
 * Calculate mean (average)
 */
export function calculateMean(values) {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
}

/**
 * Calculate standard deviation
 */
export function calculateStdDev(values, isSample = true) {
    if (!values || values.length < 2) return 0;

    const mean = calculateMean(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / (isSample ? values.length - 1 : values.length);

    return Math.sqrt(variance);
}

/**
 * Calculate Cpk (Process Capability Index)
 * Cpk = min((USL - mean) / 3σ, (mean - LSL) / 3σ)
 */
export function calculateCpk(values, usl, lsl) {
    if (!values || values.length < 2) return null;

    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values);

    if (stdDev === 0) return null;

    const cpu = (usl - mean) / (3 * stdDev);
    const cpl = (mean - lsl) / (3 * stdDev);

    return Math.min(cpu, cpl);
}

/**
 * Calculate Cp (Process Capability)
 * Cp = (USL - LSL) / 6σ
 */
export function calculateCp(values, usl, lsl) {
    if (!values || values.length < 2) return null;

    const stdDev = calculateStdDev(values);

    if (stdDev === 0) return null;

    return (usl - lsl) / (6 * stdDev);
}

/**
 * Calculate control limits (mean ± 3σ)
 */
export function calculateControlLimits(values, sigma = 3) {
    if (!values || values.length < 2) return null;

    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values);

    return {
        ucl: mean + (sigma * stdDev),
        lcl: mean - (sigma * stdDev),
        mean: mean,
        stdDev: stdDev
    };
}

/**
 * Create histogram bins
 */
export function createHistogram(values, binCount = 10) {
    if (!values || values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / binCount;

    const bins = Array(binCount).fill(0).map((_, i) => ({
        start: min + (i * binWidth),
        end: min + ((i + 1) * binWidth),
        count: 0,
        percentage: 0
    }));

    // Count values in each bin
    values.forEach(val => {
        const binIndex = Math.min(Math.floor((val - min) / binWidth), binCount - 1);
        bins[binIndex].count++;
    });

    // Calculate percentages
    bins.forEach(bin => {
        bin.percentage = (bin.count / values.length) * 100;
    });

    return bins;
}

/**
 * Calculate correlation coefficient between two datasets
 */
export function calculateCorrelation(xValues, yValues) {
    if (!xValues || !yValues || xValues.length !== yValues.length || xValues.length < 2) {
        return null;
    }

    const n = xValues.length;
    const meanX = calculateMean(xValues);
    const meanY = calculateMean(yValues);

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
        const diffX = xValues[i] - meanX;
        const diffY = yValues[i] - meanY;

        numerator += diffX * diffY;
        denomX += diffX * diffX;
        denomY += diffY * diffY;
    }

    const denominator = Math.sqrt(denomX * denomY);

    if (denominator === 0) return null;

    return numerator / denominator;
}

/**
 * Convert OLE Automation Date (used in DateTime2 column) to JavaScript Date
 * OLE Automation Date: Number of days since December 30, 1899
 */
export function oleToDate(oleDate) {
    if (!oleDate) return null;

    const epoch = new Date(1899, 11, 30); // December 30, 1899
    const milliseconds = oleDate * 24 * 60 * 60 * 1000;

    return new Date(epoch.getTime() + milliseconds);
}

/**
 * Parse potentially NVARCHAR numeric values from database
 */
export function parseNumeric(value) {
    if (value === null || value === undefined || value === '') return null;

    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
}

/**
 * Filter outliers using IQR method
 */
export function filterOutliers(values, multiplier = 1.5) {
    if (!values || values.length < 4) return values;

    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);

    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    const lowerBound = q1 - (multiplier * iqr);
    const upperBound = q3 + (multiplier * iqr);

    return values.filter(val => val >= lowerBound && val <= upperBound);
}
