import { useState, useEffect, useRef, useCallback } from 'react';
import { API_CONFIG } from '../config/config.js';

/**
 * Custom hook for polling API endpoints
 * Automatically pauses on tab visibility change and cleans up on unmount
 * 
 * @param {Function} fetchFn - Async function to call for fetching data
 * @param {number} interval - Polling interval in milliseconds (default: 3000)
 * @param {Object} options - { enabled, onError, onSuccess }
 * @returns {Object} { data, error, loading, isPaused, pause, resume, refetch }
 */
export const usePolling = (fetchFn, interval = API_CONFIG.POLLING_INTERVAL, options = {}) => {
    const { enabled = true, onError, onSuccess } = options;

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    const intervalRef = useRef(null);
    const isMountedRef = useRef(true);
    const hasLoadedRef = useRef(false); // Track if we've loaded data before

    // Fetch data function
    const fetchData = useCallback(async () => {
        if (!enabled || isPaused) return;

        try {
            // Only show loading on initial fetch (when we haven't loaded before)
            if (!hasLoadedRef.current) {
                setLoading(true);
            }

            const result = await fetchFn();

            if (isMountedRef.current) {
                setData(result);
                setError(null);
                setLoading(false);
                hasLoadedRef.current = true;
                onSuccess?.(result);
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err);
                setLoading(false); // Set to false even on error
                onError?.(err);
            }
        }
    }, [fetchFn, enabled, isPaused, onError, onSuccess]);

    // Manual refetch
    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Pause polling
    const pause = useCallback(() => {
        setIsPaused(true);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Resume polling
    const resume = useCallback(() => {
        setIsPaused(false);
    }, []);

    // Handle visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                pause();
            } else {
                resume();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [pause, resume]);

    // Polling effect
    useEffect(() => {
        if (!enabled || isPaused) return;

        // Initial fetch
        fetchData();

        // Set up polling interval
        intervalRef.current = setInterval(fetchData, interval);

        // Cleanup - only clear interval, don't mark as unmounted
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchData, interval, enabled, isPaused]);

    // Cleanup on unmount - this is the ONLY place we mark as unmounted
    useEffect(() => {
        isMountedRef.current = true; // Reset to true on mount

        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        data,
        error,
        loading,
        isPaused,
        pause,
        resume,
        refetch
    };
};

export default usePolling;
