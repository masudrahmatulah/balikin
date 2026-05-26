"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface UseAutoRefreshOptions {
  /**
   * Interval in milliseconds for auto-refresh
   * @default 60000 (60 seconds)
   */
  interval?: number;

  /**
   * Whether auto-refresh is enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback function to execute on refresh
   */
  onRefresh?: () => void | Promise<void>;

  /**
   * Whether to refresh immediately on mount
   * @default true
   */
  immediate?: boolean;

  /**
   * Whether to show refresh indicator
   * @default true
   */
  showIndicator?: boolean;
}

interface UseAutoRefreshReturn {
  /**
   * Whether data is currently being refreshed
   */
  isRefreshing: boolean;

  /**
   * Last refresh timestamp
   */
  lastRefresh: Date | null;

  /**
   * Time until next refresh in seconds
   */
  nextRefreshIn: number | null;

  /**
   * Manually trigger a refresh
   */
  refresh: () => Promise<void>;

  /**
   * Stop auto-refresh
   */
  stop: () => void;

  /**
   * Start auto-refresh
   */
  start: () => void;
}

/**
 * Reusable hook for auto-refreshing data at regular intervals
 *
 * @example
 * ```tsx
 * const { isRefreshing, lastRefresh, nextRefreshIn, refresh } = useAutoRefresh({
 *   interval: 60000, // 60 seconds
 *   onRefresh: async () => {
 *     await fetchLatestData();
 *   },
 * });
 * ```
 */
export function useAutoRefresh({
  interval = 60000,
  enabled = true,
  onRefresh,
  immediate = true,
  showIndicator = true,
}: UseAutoRefreshOptions = {}): UseAutoRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(enabled);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;

    setIsRefreshing(true);

    try {
      await onRefresh();
      setLastRefresh(new Date());
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  const start = useCallback(() => {
    setIsActive(true);

    // Clear existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // Set up refresh interval
    intervalRef.current = setInterval(() => {
      refresh();
    }, interval);

    // Set up countdown timer (update every second)
    countdownRef.current = setInterval(() => {
      setNextRefreshIn((prev) => {
        if (prev === null) return interval / 1000;
        if (prev <= 1) {
          refresh();
          return interval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    // Initial countdown
    setNextRefreshIn(interval / 1000);
  }, [interval, refresh]);

  const stop = useCallback(() => {
    setIsActive(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    setNextRefreshIn(null);
  }, []);

  // Start/stop based on enabled state
  useEffect(() => {
    if (enabled && !isActive) {
      start();
    } else if (!enabled && isActive) {
      stop();
    }
  }, [enabled, isActive, start, stop]);

  // Immediate refresh on mount
  useEffect(() => {
    if (immediate && enabled && onRefresh) {
      refresh();
    }
  }, []); // Only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  return {
    isRefreshing: showIndicator ? isRefreshing : false,
    lastRefresh,
    nextRefreshIn,
    refresh,
    stop,
    start,
  };
}

/**
 * Hook for auto-refreshing with data fetching
 * Simplified version that handles the common case of fetching data
 *
 * @example
 * ```tsx
 * const { data, isRefreshing, nextRefreshIn } = useAutoRefreshFetch({
 *   interval: 60000,
 *   fetchFn: () => fetch('/api/data').then(r => r.json()),
 * });
 * ```
 */
export function useAutoRefreshFetch<T>({
  interval = 60000,
  enabled = true,
  fetchFn,
  immediate = true,
  initialData = null,
}: {
  interval?: number;
  enabled?: boolean;
  fetchFn: () => Promise<T>;
  immediate?: boolean;
  initialData?: T | null;
}) {
  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<Error | null>(null);

  const onRefresh = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Fetch failed"));
      throw err;
    }
  }, [fetchFn]);

  const autoRefresh = useAutoRefresh({
    interval,
    enabled,
    onRefresh,
    immediate,
  });

  return {
    ...autoRefresh,
    data,
    error,
  };
}
