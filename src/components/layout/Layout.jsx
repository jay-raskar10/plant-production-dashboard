import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen bg-background font-sans antialiased text-foreground transition-colors duration-500 relative overflow-hidden">
            {/* Ambient Background Gradient for Dark Mode */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none dark:block hidden" />

            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative z-10">
                <Navbar />
                <main className="flex-1 p-6 md:p-8 xl:p-10 overflow-y-auto w-full 2xl:max-w-none 2xl:px-12 mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
