import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DisplayModeContext = createContext();

const TV_STORAGE_KEY = 'nexus-tv-mode';
const MEDIA_QUERY = '(min-width: 3840px)';

export const DisplayModeProvider = ({ children }) => {
    // Read initial state: localStorage toggle, or auto-detect 4K
    const [manualTV, setManualTV] = useState(() => {
        try {
            return localStorage.getItem(TV_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    });

    const [is4K, setIs4K] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia(MEDIA_QUERY).matches
    );

    // Listen for screen size changes (e.g. dragging between monitors)
    useEffect(() => {
        const mql = window.matchMedia(MEDIA_QUERY);
        const handler = (e) => setIs4K(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    // Computed: TV mode if manual toggle OR auto-detected 4K
    const isTV = manualTV || is4K;

    // Apply / remove .tv-mode class on <html>
    useEffect(() => {
        const html = document.documentElement;
        if (isTV) {
            html.classList.add('tv-mode');
        } else {
            html.classList.remove('tv-mode');
        }
    }, [isTV]);

    // Toggle function — persists to localStorage
    const toggleTV = useCallback(() => {
        setManualTV(prev => {
            const next = !prev;
            try { localStorage.setItem(TV_STORAGE_KEY, String(next)); } catch { }
            return next;
        });
    }, []);

    // Chart sizing values for components that use px
    const chartFontSize = isTV ? 18 : 12;
    const chartRefFontSize = isTV ? 20 : 13;
    const chartStrokeWidth = isTV ? 3 : 2;
    const chartDotRadius = isTV ? 5 : 3;
    const chartActiveDotRadius = isTV ? 8 : 5;
    const chartHeight = isTV ? 'h-[600px]' : 'h-[400px]';
    const chartHeightSmall = isTV ? 'h-[500px]' : 'h-[350px]';

    return (
        <DisplayModeContext.Provider value={{
            isTV,
            manualTV,
            is4K,
            toggleTV,
            chartFontSize,
            chartRefFontSize,
            chartStrokeWidth,
            chartDotRadius,
            chartActiveDotRadius,
            chartHeight,
            chartHeightSmall,
        }}>
            {children}
        </DisplayModeContext.Provider>
    );
};

export const useDisplayMode = () => useContext(DisplayModeContext);
