import React from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFilters } from '@/context/FilterContext';

const Navbar = () => {
    const { filters, updateFilter, metadata, metadataLoading } = useFilters();

    // Cascading options
    const filteredLines = filters.plant === 'all'
        ? metadata.lines
        : metadata.lines.filter(l => l.plant_id === filters.plant);

    const filteredStations = filters.line === 'all'
        ? metadata.stations_meta
        : metadata.stations_meta.filter(s => s.line_id === filters.line);

    // Date ranges - static for now
    const DATERANGES = [
        { id: 'today', name: 'Today' },
        { id: 'yesterday', name: 'Yesterday' },
        { id: 'last7', name: 'Last 7 Days' },
        { id: 'last30', name: 'Last 30 Days' },
        { id: 'custom', name: 'Custom' }
    ];

    if (metadataLoading) {
        return (
            <header className="sticky top-0 z-30 w-full min-h-16 border-b border-border/60 bg-background/95 backdrop-blur-md flex items-center px-6 py-2">
                <div className="text-sm text-muted-foreground">Loading filters...</div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-30 w-full min-h-16 border-b border-border/60 bg-background/95 backdrop-blur-md flex flex-wrap items-center px-6 py-2 gap-4 justify-between">

            {/* Global Filters Bar */}
            <div className="flex flex-wrap items-center gap-2 flex-1">

                {/* Plant Selector */}
                <Select
                    value={filters.plant}
                    onChange={(e) => updateFilter('plant', e.target.value)}
                    className="w-[120px] h-8 text-xs font-medium"
                >
                    <option value="all">All Plants</option>
                    {metadata.plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>

                {/* Line Selector */}
                <Select
                    value={filters.line}
                    onChange={(e) => updateFilter('line', e.target.value)}
                    className="w-[120px] h-8 text-xs font-medium"
                >
                    <option value="all">All Lines</option>
                    {filteredLines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>

                {/* Station Selector */}
                <Select
                    value={filters.station}
                    onChange={(e) => updateFilter('station', e.target.value)}
                    className="w-[120px] h-8 text-xs font-medium"
                >
                    <option value="all">All Stations</option>
                    {filteredStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>

                <div className="h-6 w-px bg-border mx-1 hidden md:block" />

                {/* Shift Selector */}
                <Select
                    value={filters.shift}
                    onChange={(e) => updateFilter('shift', e.target.value)}
                    className="w-[110px] h-8 text-xs font-medium"
                >
                    {metadata.shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>

                {/* Date Selector */}
                <Select
                    value={filters.dateRange}
                    onChange={(e) => updateFilter('dateRange', e.target.value)}
                    className="w-[120px] h-8 text-xs font-medium"
                >
                    {DATERANGES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>

                <div className="h-6 w-px bg-border mx-1 hidden md:block" />

                {/* View Mode Selector - Highlighted */}
                <div className="bg-primary/10 rounded-md p-0.5">
                    <Select
                        value={filters.viewMode}
                        onChange={(e) => updateFilter('viewMode', e.target.value)}
                        className="w-[140px] h-8 text-xs font-bold border-primary/20 text-primary"
                    >
                        <option value="production">📊 Production</option>
                        <option value="spc">📈 SPC Dashboard</option>
                    </Select>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {/* Connection status indicator - will be added later */}
            </div>
        </header>
    );
};

export default Navbar;
