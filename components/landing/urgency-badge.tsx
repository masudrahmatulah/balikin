'use client';

import { motion } from 'framer-motion';
import { Clock, Users, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UrgencyBadgeProps {
  type?: 'countdown' | 'limited' | 'both';
  className?: string;
  initialHours?: number;
  initialSpots?: number;
}

export function UrgencyBadge({
  type = 'both',
  className = '',
  initialHours = 5,
  initialSpots = 47,
}: UrgencyBadgeProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: initialHours,
    minutes: 23,
    seconds: 59,
  });
  const [spots, setSpots] = useState(initialSpots);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        seconds--;

        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }

        if (minutes < 0) {
          minutes = 59;
          hours--;
        }

        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    // Randomly decrease spots occasionally for FOMO effect
    const spotsTimer = setInterval(() => {
      if (Math.random() > 0.7 && spots > 5) {
        setSpots((prev) => prev - 1);
      }
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(spotsTimer);
    };
  }, [spots]);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  if (type === 'limited') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-red-500/20 ${className}`}
      >
        <Users className="h-4 w-4" />
        <span>Sisa {spots} slot harga promo hari ini!</span>
      </motion.div>
    );
  }

  if (type === 'countdown') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-red-500/20 ${className}`}
      >
        <Clock className="h-4 w-4" />
        <div className="flex items-center gap-1">
          <span className="bg-white/20 px-2 py-1 rounded font-bold">
            {formatTime(timeLeft.hours)}
          </span>
          <span>:</span>
          <span className="bg-white/20 px-2 py-1 rounded font-bold">
            {formatTime(timeLeft.minutes)}
          </span>
          <span>:</span>
          <span className="bg-white/20 px-2 py-1 rounded font-bold">
            {formatTime(timeLeft.seconds)}
          </span>
        </div>
        <span>tersisa!</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-red-500/20 ${className}`}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        <Flame className="h-4 w-4" />
      </motion.div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          Sisa {spots} slot
        </span>
        <span className="hidden sm:inline text-white/50">|</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
        </span>
      </div>
    </motion.div>
  );
}

// Simple version for inline use
export function SimpleUrgencyBadge({ spots = 47, className = '' }: { spots?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`inline-flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium ${className}`}
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        🔥
      </motion.span>
      Sisa {spots} slot hari ini
    </motion.div>
  );
}

// Flash sale banner component
export function FlashSaleBanner({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-2 px-4 ${className}`}
    >
      <div className="container mx-auto flex items-center justify-center gap-3">
        <motion.span
          animate={{ rotate: [0, 20, -20, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          className="text-xl"
        >
          ⚡
        </motion.span>
        <span className="font-bold text-sm md:text-base">
          FLASH SALE: Diskon 30% untuk 100 pembeli pertama hari ini!
        </span>
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-xl"
        >
          🔥
        </motion.span>
      </div>
    </motion.div>
  );
}
