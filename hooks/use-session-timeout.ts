"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Session timeout hook
 * Automatically logs out user after 30 minutes of inactivity
 * Shows warning at 25 minutes
 *
 * @param timeoutMinutes - Session timeout in minutes (default: 30)
 * @param warningMinutes - Show warning at X minutes remaining (default: 5)
 */
export function useSessionTimeout(
  timeoutMinutes: number = 30,
  warningMinutes: number = 5
) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const TIMEOUT_MS = timeoutMinutes * 60 * 1000;
  const WARNING_MS = (timeoutMinutes - warningMinutes) * 60 * 1000;

  const resetActivityTimers = () => {
    // Clear existing timers
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Reset warning state
    setShowWarning(false);

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(warningMinutes * 60); // Convert to seconds
    }, WARNING_MS);

    // Set timeout timer
    activityTimeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, TIMEOUT_MS);
  };

  const handleTimeout = async () => {
    setIsTimedOut(true);

    // Call logout API
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Redirect to login
    router.push("/sign-in?reason=session_timeout");
  };

  const extendSession = async () => {
    // Reset activity timers
    resetActivityTimers();

    // Call session refresh API
    try {
      await fetch("/api/admin/refresh-session", { method: "POST" });
    } catch (error) {
      console.error("Session refresh error:", error);
    }
  };

  useEffect(() => {
    // Initialize timers on mount
    resetActivityTimers();

    // Set up activity listeners
    const events = ["mousedown", "keydown", "scroll", "touchstart"];

    const handleActivity = () => {
      if (!isTimedOut) {
        extendSession();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Countdown timer when warning is shown
    const countdownInterval = setInterval(() => {
      if (showWarning && timeRemaining > 0) {
        setTimeRemaining((prev) => prev - 1);
      }
    }, 1000);

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (checkTimeoutRef.current) {
        clearInterval(checkTimeoutRef.current);
      }
      clearInterval(countdownInterval);
    };
  }, [showWarning, isTimedOut]);

  return {
    showWarning,
    timeRemaining,
    isTimedOut,
    extendSession,
    formatTimeRemaining: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },
  };
}
