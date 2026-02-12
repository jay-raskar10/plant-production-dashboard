import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService.js';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    const [filters, setFilters] = useState({
        plant: 'pune',
        line: 'fcpv',
        station: 'all',
        shift: 'all',
        dateRange: 'today',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        viewMode: 'production', // 'production' or 'spc'
    });

    const [metadata, setMetadata] = useState({
        plants: [],
        lines: [],
        stations_meta: [],
        shifts: []
    });

    const [metadataLoading, setMetadataLoading] = useState(true);
    const [metadataError, setMetadataError] = useState(null);

    // Use local metadata directly since /api/meta is not active on the live server
    useEffect(() => {
        const loadMetadata = async () => {
            setMetadataLoading(true);
            try {
                // We use the imported data from ../lib/data.js if available
                // or just import them here to be explicit
                const { PLANTS, LINES, STATIONS, SHIFTS } = await import('../lib/data.js');
                setMetadata({
                    plants: PLANTS,
                    lines: LINES,
                    stations_meta: STATIONS,
                    shifts: SHIFTS
                });
            } catch (error) {
                console.error('Failed to load local metadata:', error);
                setMetadataError(error.message);
            } finally {
                setMetadataLoading(false);
            }
        };

        loadMetadata();
    }, []);

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <FilterContext.Provider value={{
            filters,
            updateFilter,
            metadata,
            metadataLoading,
            metadataError
        }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilters = () => useContext(FilterContext);
