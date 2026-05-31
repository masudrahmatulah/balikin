"use client";

import { useState, useEffect } from "react";

interface WITAClockProps {
  showSeconds?: boolean;
  showDate?: boolean;
  className?: string;
}

/**
 * WITA Clock Component
 * Displays real-time Asia/Makassar (WITA) timezone clock
 * Important for production workflow synchronization:
 * - 08:00 WITA: Daily production reports
 * - 14:00 WITA: Daily pick-up deadline
 */
export function WITAClock({ showSeconds = false, showDate = false, className = "" }: WITAClockProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Format time in WITA timezone (Asia/Makassar, UTC+8)
      const timeOptions: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Makassar",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        ...(showSeconds && { second: "2-digit" }),
      };

      const timeString = now.toLocaleTimeString("en-US", timeOptions);
      setTime(timeString);

      if (showDate) {
        const dateOptions: Intl.DateTimeFormatOptions = {
          timeZone: "Asia/Makassar",
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        };

        const dateString = now.toLocaleDateString("en-US", dateOptions);
        setDate(dateString);
      }
    };

    // Update immediately and then every second
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [showSeconds, showDate]);

  return (
    <div className={`flex flex-col items-end ${className}`}>
      {showDate && date && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {date}
        </span>
      )}
      <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
        {time} WITA
      </div>
    </div>
  );
}

/**
 * Production deadline indicator
 * Shows warnings based on current WITA time
 */
export function ProductionDeadlineIndicator() {
  const [deadlineStatus, setDeadlineStatus] = useState<{
    status: "normal" | "warning" | "critical";
    message: string;
  }>({
    status: "normal",
    message: "",
  });

  useEffect(() => {
    const checkDeadline = () => {
      const now = new Date();
      const witaTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Makassar" })
      );

      const hours = witaTime.getHours();
      const minutes = witaTime.getMinutes();
      const currentTimeMinutes = hours * 60 + minutes;

      const deadlineTime = 14 * 60; // 14:00 WITA (2:00 PM)
      const warningTime = 13 * 60; // 13:00 WITA (1:00 PM) - 1 hour before deadline

      if (currentTimeMinutes >= deadlineTime) {
        setDeadlineStatus({
          status: "critical",
          message: "Past daily pick-up deadline!",
        });
      } else if (currentTimeMinutes >= warningTime) {
        const remainingMinutes = deadlineTime - currentTimeMinutes;
        setDeadlineStatus({
          status: "warning",
          message: `${remainingMinutes} min until pick-up deadline`,
        });
      } else {
        setDeadlineStatus({
          status: "normal",
          message: "",
        });
      }
    };

    checkDeadline();
    const interval = setInterval(checkDeadline, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (deadlineStatus.status === "normal") {
    return null;
  }

  const colorClasses = {
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
    critical: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
  };

  return (
    <div
      className={`px-3 py-1.5 rounded-md border text-xs font-medium flex items-center gap-2 ${colorClasses[deadlineStatus.status]}`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{deadlineStatus.message}</span>
    </div>
  );
}
