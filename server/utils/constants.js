// Application Constants

export const STATIONS = ['OP10', 'OP20', 'OP30', 'OP50', 'OP60', 'OP80'];

export const PARAMETERS = {
    OP10: ['LVDT', 'Spring'],
    OP20: ['LVDT_A', 'LVDT_B', 'Spring'],
    OP30: ['LVDT_A', 'Spring_Load_B'],
    OP50: ['LVDT', 'Port1_Torque', 'Port21_Torque', 'Port4_Torque'],
    OP60: ['Cartage_Torque'],
    OP80: ['PT1', 'PT2', 'Leak', 'Delta_PT2']
};

// Map parameter names to actual database column names
export const COLUMN_MAPPINGS = {
    OP10: {
        LVDT: 'lvdt_Data',
        Spring: 'Spring_Data'
    },
    OP20: {
        LVDT_A: 'LVDT_A',
        LVDT_B: 'LVDT_B',
        Spring: 'Spring_Value'
    },
    OP30: {
        LVDT_A: 'LVDT_Actual_A',
        Spring_Load_B: 'Spring_Load_Actual_B'
    },
    OP50: {
        LVDT: 'LVDT_Actual',
        Port1_Torque: 'Port1_Torque',
        Port21_Torque: 'Port21_Torque',
        Port4_Torque: 'Port4_Torque'
    },
    OP60: {
        Cartage_Torque: 'Cartage_Torque_Result'
    },
    OP80: {
        PT1: 'PT1',
        PT2: 'PT2',
        Leak: 'Leak_Actual',
        Delta_PT2: 'Delta_PT2'
    }
};

// Recipe Master column mappings for control limits
export const RECIPE_LIMITS = {
    OP10: {
        LVDT: { min: 'OP10_LVDT_Min', max: 'OP10_LVDT_Max' },
        Spring: { min: 'OP10_SL_Min', max: 'OP10_SL_Max' }
    },
    OP20: {
        LVDT_A: { min: 'OP20_LVDTA_Min', max: 'OP20_LVDTA_Max' },
        LVDT_B: { min: 'OP20_LVDTB_Min', max: 'OP20_LVDTB_Max' },
        Spring: { min: 'OP20_SL_Min', max: 'OP20_SL_Max' }
    },
    OP30: {
        LVDT_A: { min: 'OP30_LVDT_Min', max: 'OP30_LVDT_Max' },
        Spring_Load_B: { min: 'OP30_SL_Min', max: 'OP30_SL_Max' }
    },
    OP50: {
        LVDT: { min: 'OP50_LVDT_Min', max: 'OP50_LVDT_Max' }
    },
    OP60: {
        Cartage_Torque: { min: 'OP60_Torque_Min', max: 'OP60_Torque_Max' }
    },
    OP80: {
        PT1: { min: 'PT1_Min', max: 'PT1_Max' },
        PT2: { min: 'PT2_Min', max: 'PT2_Max' },
        Delta_PT2: { min: 'DELTA_PT2', max: 'DELTA_PT2' }
    }
};

export const SHIFTS = ['Day', 'Evening', 'Night'];

export const DEFAULT_DATE_RANGE_DAYS = 7;

export const CONTROL_LIMIT_SIGMA = 3; // ±3σ for control limits

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
};

export const ERROR_CODES = {
    DB_CONNECTION: 'DB_CONNECTION_ERROR',
    QUERY_FAILED: 'QUERY_FAILED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND'
};
