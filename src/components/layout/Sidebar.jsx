import React, { useState } from 'react';
import {
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';
import { useFilters } from '@/context/FilterContext';

const SidebarItem = ({ icon: Icon, label, href, active, collapsed, onClick }) => {
    const content = (
        <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative overflow-hidden cursor-pointer",
            active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            collapsed && "justify-center px-2"
        )}>
            {/* Active Accent Strip */}
            {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            )}

            <Icon className={cn(
                "h-5 w-5 shrink-0 transition-colors duration-200",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )} />

            {!collapsed && (
                <span className="truncate text-sm tracking-tight">{label}</span>
            )}

            {collapsed && (
                <div className="absolute left-16 bg-popover text-popover-foreground px-2 py-1 rounded text-sm shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap border border-border">
                    {label}
                </div>
            )}
        </div>
    );

    if (onClick) {
        return <div onClick={onClick} className="block relative">{content}</div>;
    }
    return <Link to={href} className="block relative">{content}</Link>;
};

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { filters, updateFilter, metadata, metadataLoading } = useFilters();

    // Cascading filter options
    const filteredLines = filters.plant === 'all'
        ? metadata.lines
        : metadata.lines.filter(l => l.plant_id === filters.plant);

    const filteredStations = filters.line === 'all'
        ? metadata.stations_meta
        : metadata.stations_meta.filter(s => s.line_id === filters.line);

    return (
        <aside
            className={cn(
                "h-screen sticky top-0 bg-card border-r border-border z-40 flex flex-col transition-[width] duration-300 ease-in-out",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Brand Header */}
            <div className="h-16 flex items-center border-b border-border bg-background transition-all duration-300">
                <div className={cn("flex items-center w-full transition-all duration-300 h-full", collapsed ? "justify-center" : "justify-start px-4")}>
                    {!collapsed ? (
                        <div className="animate-in fade-in duration-500">
                            <img
                                src="/knorr-bremse.svg"
                                alt="Knorr-Bremse"
                                className="h-7 w-auto object-contain transition-all hover:scale-105"
                            />
                        </div>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center p-3 animate-in zoom-in duration-500 overflow-hidden">
                            <img
                                src="/KB.svg"
                                alt="KB"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 flex flex-col overflow-x-hidden">

                {/* ── CONTEXT filters (Plant → Line → Station) ── */}
                {!collapsed && !metadataLoading && (
                    <div className="px-3 pt-5 pb-3 border-b border-border">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3 px-1">
                            Context
                        </p>
                        <div className="space-y-2">
                            <div className="space-y-0.5">
                                <label className="text-[10px] uppercase font-semibold text-muted-foreground px-1">Plant</label>
                                <Select
                                    value={filters.plant}
                                    onChange={(e) => updateFilter('plant', e.target.value)}
                                    className="w-full h-8 text-xs font-medium"
                                >
                                    <option value="all">All Plants</option>
                                    {metadata.plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </Select>
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[10px] uppercase font-semibold text-muted-foreground px-1">Line</label>
                                <Select
                                    value={filters.line}
                                    onChange={(e) => updateFilter('line', e.target.value)}
                                    className="w-full h-8 text-xs font-medium"
                                >
                                    <option value="all">All Lines</option>
                                    {filteredLines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </Select>
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[10px] uppercase font-semibold text-muted-foreground px-1">Station</label>
                                <Select
                                    value={filters.station}
                                    onChange={(e) => updateFilter('station', e.target.value)}
                                    className="w-full h-8 text-xs font-medium"
                                >
                                    <option value="all">All Stations</option>
                                    {filteredStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Collapsed state: show compact filter icons with tooltips */}
                {collapsed && !metadataLoading && (
                    <div className="px-2 pt-4 pb-3 border-b border-border flex flex-col items-center gap-2">
                        {/* Mini indicators showing current selections */}
                        <div
                            className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-[9px] font-bold text-muted-foreground uppercase relative group cursor-default"
                            title={`Plant: ${filters.plant === 'all' ? 'All' : metadata.plants.find(p => p.id === filters.plant)?.name || filters.plant}`}
                        >
                            P
                            <div className="absolute left-10 bg-popover text-popover-foreground px-2 py-1 rounded text-xs shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap border border-border">
                                Plant: {filters.plant === 'all' ? 'All' : metadata.plants.find(p => p.id === filters.plant)?.name}
                            </div>
                        </div>
                        <div
                            className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-[9px] font-bold text-muted-foreground uppercase relative group cursor-default"
                            title={`Line: ${filters.line === 'all' ? 'All' : filteredLines.find(l => l.id === filters.line)?.name || filters.line}`}
                        >
                            L
                            <div className="absolute left-10 bg-popover text-popover-foreground px-2 py-1 rounded text-xs shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap border border-border">
                                Line: {filters.line === 'all' ? 'All' : filteredLines.find(l => l.id === filters.line)?.name}
                            </div>
                        </div>
                        <div
                            className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-[9px] font-bold text-muted-foreground uppercase relative group cursor-default"
                            title={`Station: ${filters.station === 'all' ? 'All' : filteredStations.find(s => s.id === filters.station)?.name || filters.station}`}
                        >
                            S
                            <div className="absolute left-10 bg-popover text-popover-foreground px-2 py-1 rounded text-xs shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap border border-border">
                                Station: {filters.station === 'all' ? 'All' : filteredStations.find(s => s.id === filters.station)?.name}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── VIEWS navigation ── */}
                <div className="py-4 px-3 space-y-1">
                    {!collapsed && (
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2 px-1">
                            Views
                        </p>
                    )}
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Production"
                        href="/"
                        active={filters.viewMode === 'production' && (location.pathname === '/' || location.pathname.startsWith('/station'))}
                        collapsed={collapsed}
                        onClick={() => updateFilter('viewMode', 'production')}
                    />
                    <SidebarItem
                        icon={BarChart2}
                        label="SPC Dashboard"
                        href="/"
                        active={filters.viewMode === 'spc'}
                        collapsed={collapsed}
                        onClick={() => updateFilter('viewMode', 'spc')}
                    />
                </div>
            </div>

            {/* Footer — Collapse toggle */}
            <div className="p-3 border-t border-border">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed
                        ? <ChevronRight className="h-4 w-4" />
                        : <div className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /><span className="text-xs">Collapse</span></div>
                    }
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;
