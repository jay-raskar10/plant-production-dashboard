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

    // Fetch metadata on mount
    useEffect(() => {
        const loadMetadata = async () => {
            try {
                setMetadataLoading(true);
                const data = await apiService.getMetadata();
                setMetadata(data);
                setMetadataError(null);
            } catch (error) {
                console.error('Failed to load metadata:', error);
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
