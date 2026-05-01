'use client';

import { useEffect, useState } from 'react';
import { updateLatestScanLocation } from '@/app/actions/scan';

interface PremiumGeolocationProps {
  tagId: string;
  isPremium: boolean;
}

export function PremiumGeolocation({ tagId, isPremium }: PremiumGeolocationProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'success' | 'denied'>('idle');

  useEffect(() => {
    // Only trigger geolocation for premium tags
    if (!isPremium) {
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }

    setStatus('requesting');

    // Request high-accuracy location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Send location to server - update the latest scan log
        updateLatestScanLocation(tagId, { latitude, longitude, accuracy })
          .then((result) => {
            if (result.success) {
              console.log('Premium geolocation updated successfully');
              setStatus('success');
            } else {
              console.error('Failed to update location:', result.error);
            }
          })
          .catch((error) => {
            console.error('Failed to update location:', error);
          });
      },
      (error) => {
        console.log('Geolocation permission denied or error:', error.code, error.message);
        setStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [tagId, isPremium]);

  // This component doesn't render anything visible
  return null;
}
