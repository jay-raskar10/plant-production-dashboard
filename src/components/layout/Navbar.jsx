import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFilters } from '@/context/FilterContext';
import { useDisplayMode } from '@/context/DisplayModeContext';
import { Check, Monitor, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const { filters, updateFilter, metadata, metadataLoading } = useFilters();
    const { isTV, manualTV, toggleTV, is4K } = useDisplayMode();
    const [tempStartDate, setTempStartDate] = useState(filters.startDate);
    const [tempEndDate, setTempEndDate] = useState(filters.endDate);

    // Sync local state when global filters change (if not in custom mode)
    useEffect(() => {
        if (filters.dateRange !== 'custom') {
            setTempStartDate(filters.startDate);
            setTempEndDate(filters.endDate);
        }
    }, [filters.startDate, filters.endDate, filters.dateRange]);

    const handleApplyDates = () => {
        updateFilter('startDate', tempStartDate);
        updateFilter('endDate', tempEndDate);
    };

    const isDateChanged = tempStartDate !== filters.startDate || tempEndDate !== filters.endDate;

    const DATERANGES = [
        { id: 'today', name: 'Today' },
        { id: 'yesterday', name: 'Yesterday' },
        { id: 'last7', name: 'Last 7 Days' },
        { id: 'last30', name: 'Last 30 Days' },
        { id: 'custom', name: 'Custom' }
    ];

    if (metadataLoading) {
        return (
            <header className="sticky top-0 z-30 w-full h-16 border-b border-border bg-background flex items-center px-6">
                <div className="text-sm text-muted-foreground">Loading filters...</div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-30 w-full h-16 border-b border-border bg-background flex items-center px-6 gap-3 justify-between">

            {/* Left: Shift + Date controls */}
            <div className="flex items-center gap-2 flex-1">

                {/* Shift Selector */}
                <Select
                    value={filters.shift}
                    onChange={(e) => updateFilter('shift', e.target.value)}
                    className="w-[110px] h-8 text-xs font-medium"
                >
                    {metadata.shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>

                <div className="h-6 w-px bg-border" />

                {/* Date Selector */}
                <div className="flex items-center gap-2">
                    <Select
                        value={filters.dateRange}
                        onChange={(e) => updateFilter('dateRange', e.target.value)}
                        className="w-[130px] h-8 text-xs font-medium"
                    >
                        {DATERANGES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </Select>

                    {filters.dateRange === 'custom' && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                            <div className="relative group">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-muted-foreground transition-colors group-focus-within:text-primary">From</span>
                                <input
                                    type="date"
                                    value={tempStartDate}
                                    onChange={(e) => setTempStartDate(e.target.value)}
                                    className="h-8 pl-10 pr-2 rounded-md border border-input bg-background/50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all hover:bg-accent/50"
                                />
                            </div>
                            <div className="relative group">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-muted-foreground transition-colors group-focus-within:text-primary">To</span>
                                <input
                                    type="date"
                                    value={tempEndDate}
                                    onChange={(e) => setTempEndDate(e.target.value)}
                                    className="h-8 pl-6 pr-2 rounded-md border border-input bg-background/50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all hover:bg-accent/50"
                                />
                            </div>
                            <Button
                                size="sm"
                                variant={isDateChanged ? "default" : "outline"}
                                className={cn(
                                    "h-8 px-3 gap-1.5 transition-all duration-200",
                                    isDateChanged
                                        ? "shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 active:shadow-inner bg-primary hover:bg-primary/90"
                                        : "opacity-50 grayscale cursor-default"
                                )}
                                onClick={handleApplyDates}
                                disabled={!isDateChanged}
                            >
                                <Check className="h-3.5 w-3.5" />
                                Apply
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: TV Mode Toggle + DAT Logo */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleTV}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-wider transition-all",
                        isTV
                            ? "bg-primary text-white border-primary"
                            : "bg-muted text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                    )}
                    title={isTV ? 'Switch to Desktop mode' : 'Switch to TV/Kiosk mode (1.5× scale)'}
                >
                    {isTV ? <Tv className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                    {isTV ? 'TV' : 'Desktop'}
                    {is4K && !manualTV && (
                        <span className="text-[9px] opacity-70">AUTO</span>
                    )}
                </button>

                <div className="h-6 w-px bg-border" />

                <div className="flex items-center cursor-default" title="Developed by Data Acquisition Technology">
                    <img
                        src="/DAT.svg"
                        alt="DAT Logo"
                        className="h-12 w-auto object-contain"
                    />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
