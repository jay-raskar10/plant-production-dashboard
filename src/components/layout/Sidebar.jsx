import React, { useState } from 'react';
import {
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, href, active, collapsed }) => (
    <Link to={href} className="block relative">
        <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative overflow-hidden",
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
                <div className="absolute left-16 bg-popover text-popover-foreground px-2 py-1 rounded-md text-sm shadow-xl invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap border border-border/50 backdrop-blur-md">
                    {label}
                </div>
            )}
        </div>
    </Link>
);

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside
            className={cn(
                "h-screen sticky top-0 bg-card border-r border-border z-40 flex flex-col transition-all duration-300 ease-in-out shadow-sm",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Brand Header */}
            <div className="h-16 flex items-center border-b border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300">
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

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                <SidebarItem
                    icon={LayoutDashboard}
                    label="Overview"
                    href="/"
                    active={location.pathname === '/' || location.pathname.startsWith('/station')}
                    collapsed={collapsed}
                />
            </div>

            {/* Footer / User Profile */}
            <div className="p-3 border-t border-border/50">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <div className="flex items-center gap-2"><ChevronLeft className="h-4 w-4" /> <span className="text-xs">Collapse</span></div>}
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;
