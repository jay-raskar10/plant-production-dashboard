import React from 'react';
import { useFilters } from '@/context/FilterContext';
import ProductionDashboard from '@/components/dashboard/ProductionDashboard';
import SPCDashboard from '@/components/dashboard/SPCDashboard';

export default function Dashboard() {
    const { filters } = useFilters();

    return (
        <>
            {filters.viewMode === 'spc' ? (
                <SPCDashboard />
            ) : (
                <ProductionDashboard />
            )}
        </>
    );
}
