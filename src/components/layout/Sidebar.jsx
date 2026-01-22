import React, { useState } from 'react';
import {
    LayoutDashboard,
    Settings,
    BarChart3,
    FileText,
    Menu,
    X,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight
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
                <SidebarItem
                    icon={BarChart3}
                    label="Reports"
                    href="/reports"
                    active={location.pathname === '/reports'}
                    collapsed={collapsed}
                />
                <SidebarItem
                    icon={FileText}
                    label="Line Logs"
                    href="/logs"
                    active={location.pathname === '/logs'}
                    collapsed={collapsed}
                />
                <div className="pt-4 mt-4 border-t border-border/50">
                    <SidebarItem
                        icon={Settings}
                        label="Settings"
                        href="/settings"
                        active={location.pathname === '/settings'}
                        collapsed={collapsed}
                    />
                </div>
            </div>

            {/* Footer / User Profile */}
            <div className="p-3 border-t border-border/50">
                <div className={cn(
                    "flex items-center gap-3 p-2 rounded-lg bg-secondary/50 border border-transparent hover:border-border transition-colors cursor-pointer",
                    collapsed && "justify-center"
                )}>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">Jay Raskar</span>
                            <span className="text-xs text-muted-foreground truncate">Plant Manager</span>
                        </div>
                    )}
                </div>
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
