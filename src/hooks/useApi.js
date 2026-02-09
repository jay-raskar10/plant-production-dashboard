import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for API calls with caching and request deduplication
 * 
 * @param {Function} apiFn - API function to call
 * @param {Array} deps - Dependencies that trigger refetch
 * @param {Object} options - { immediate, cacheKey, cacheDuration }
 * @returns {Object} { data, error, loading, refetch }
 */
export const useApi = (apiFn, deps = [], options = {}) => {
    const { immediate = true, cacheKey = null, cacheDuration = 60000 } = options;

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(immediate);

    const isMountedRef = useRef(true);
    const cacheRef = useRef(new Map());

    // Check cache
    const getCachedData = useCallback(() => {
        if (!cacheKey) return null;

        const cached = cacheRef.current.get(cacheKey);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > cacheDuration;
        if (isExpired) {
            cacheRef.current.delete(cacheKey);
            return null;
        }

        return cached.data;
    }, [cacheKey, cacheDuration]);

    // Set cache
    const setCachedData = useCallback((data) => {
        if (!cacheKey) return;

        cacheRef.current.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }, [cacheKey]);

    // Fetch function
    const fetchData = useCallback(async () => {
        // Check cache first
        const cachedData = getCachedData();
        if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return cachedData;
        }

        setLoading(true);

        try {
            const result = await apiFn();

            if (isMountedRef.current) {
                setData(result);
                setError(null);
                setCachedData(result);
            }

            return result;
        } catch (err) {
            if (isMountedRef.current) {
                setError(err);
                console.error('API Error:', err);
            }
            throw err;
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [apiFn, getCachedData, setCachedData]);

    // Initial fetch
    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, [...deps, fetchData, immediate]);

    // Cleanup
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return {
        data,
        error,
        loading,
        refetch: fetchData
    };
};

export default useApi;
