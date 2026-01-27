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
    <Link to={href}>
        <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group",
            active
                ? "bg-primary text-primary-foreground shadow-sm font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            collapsed && "justify-center px-2"
        )}>
            <Icon className={cn("h-5 w-5 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
            {!collapsed && <span className="truncate">{label}</span>}
            {collapsed && (
                <div className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded-md text-sm shadow-md invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap border">
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
            <div className="h-16 flex items-center px-4 border-b border-border/50">
                <div className={cn("flex items-center gap-3 w-full", collapsed ? "justify-center" : "justify-between")}>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-none tracking-tight text-foreground">Knorr-Bremse</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">NPI Dashboard</span>
                        </div>
                    )}
                    {collapsed && <span className="font-bold text-xl text-primary">KB</span>}
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
