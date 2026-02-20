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
        resolution: 'raw', // Derived automatically from dateRange
    });

    /**
     * Derive resolution from dateRange (or custom date span).
     * This is the "brain" of the Zoom Strategy.
     */
    const deriveResolution = (dateRange, startDate, endDate) => {
        if (dateRange === 'today' || dateRange === 'yesterday') return 'raw';
        if (dateRange === 'last7') return 'shift';
        if (dateRange === 'last30') return 'day';

        // Custom date range — calculate span in days
        if (dateRange === 'custom' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) return 'raw';
            if (diffDays <= 7) return 'shift';
            if (diffDays <= 30) return 'day';
            return 'month'; // 30+ days
        }

        return 'raw'; // fallback
    };

    // Auto-derive resolution when dateRange or custom dates change
    useEffect(() => {
        const newResolution = deriveResolution(filters.dateRange, filters.startDate, filters.endDate);
        setFilters(prev => {
            if (prev.resolution === newResolution) return prev; // avoid unnecessary re-render
            return { ...prev, resolution: newResolution };
        });
    }, [filters.dateRange, filters.startDate, filters.endDate]);

    // --- Metadata loading (plants, lines, stations, shifts) ---
    const [metadata, setMetadata] = useState({
        plants: [],
        lines: [],
        stations_meta: [],
        shifts: []
    });

    const [metadataLoading, setMetadataLoading] = useState(true);
    const [metadataError, setMetadataError] = useState(null);

    useEffect(() => {
        const loadMetadata = async () => {
            setMetadataLoading(true);
            try {
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
