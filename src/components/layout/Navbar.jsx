import React from 'react';
import { Bell, Search, Calendar, ChevronDown } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const Navbar = ({ filters, setFilters }) => {
    const handlePlantChange = (e) => setFilters(prev => ({ ...prev, plant: e.target.value }));
    const handleLineChange = (e) => setFilters(prev => ({ ...prev, line: e.target.value }));

    return (
        <header className="sticky top-0 z-30 w-full h-16 border-b border-border/60 bg-background/80 backdrop-blur-md flex items-center px-6 justify-between gap-4">

            {/* Left: Context Selectors */}
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg border border-border/50">
                    <Select
                        value={filters.plant}
                        onChange={handlePlantChange}
                        className="w-[140px] font-medium h-8 border-none bg-transparent focus:ring-0 text-sm"
                    >
                        <option value="Pune">📍 Pune</option>
                        <option value="Chennai">📍 Chennai</option>
                    </Select>
                    <span className="text-muted-foreground/40 font-light">|</span>
                    <Select
                        value={filters.line}
                        onChange={handleLineChange}
                        className="w-[160px] font-medium h-8 border-none bg-transparent focus:ring-0 text-sm"
                    >
                        <option value="FCPV">🏭 FCPV Line</option>
                        <option value="LACV">🏭 LACV Line</option>
                        <option value="Compressor">🏭 Compressor</option>
                    </Select>
                </div>

                {/* Date Display (Visual only) */}
                <div className="hidden lg:flex items-center text-sm text-muted-foreground gap-2 ml-4">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                        placeholder="Search stations, errors..."
                    />
                </div>

                <Button variant="outline" size="icon" className="relative h-9 w-9 rounded-full border-border/60">
                    <Bell className="h-4 w-4 text-foreground/70" />
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background"></span>
                </Button>
            </div>
        </header>
    );
};

export default Navbar;
