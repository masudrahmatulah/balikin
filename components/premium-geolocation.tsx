'use client';

import { useEffect, useState } from 'react';
import { updateLatestScanLocation } from '@/app/actions/scan';
import { MapPin, X } from 'lucide-react';

interface PremiumGeolocationProps {
  tagId: string;
  isPremium: boolean;
}

export function PremiumGeolocation({ tagId, isPremium }: PremiumGeolocationProps) {
  const [status, setStatus] = useState<'idle' | 'consent' | 'requesting' | 'success' | 'denied'>('idle');
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Only trigger for premium tags
    if (!isPremium) {
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }

    // Show consent banner after a short delay
    const timer = setTimeout(() => {
      setStatus('consent');
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPremium]);

  const handleAllowLocation = () => {
    setStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        updateLatestScanLocation(tagId, { latitude, longitude, accuracy })
          .then((result) => {
            if (result.success) {
              setStatus('success');
              setShowBanner(false);
            } else {
              console.error('Failed to update location:', result.error);
              setStatus('denied');
            }
          })
          .catch((error) => {
            console.error('Failed to update location:', error);
            setStatus('denied');
          });
      },
      (error) => {
        console.log('Geolocation permission denied:', error.code);
        setStatus('denied');
        setShowBanner(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleDismiss = () => {
    setStatus('denied');
    setShowBanner(false);
  };

  if (!showBanner || status === 'idle' || status === 'success') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white border border-blue-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900 mb-1">
              {status === 'consent' ? 'Share Location?' : 'Getting Location...'}
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Help find this lost item by sharing your location with the owner.
            </p>
            <div className="flex gap-2">
              {status === 'consent' ? (
                <>
                  <button
                    onClick={handleAllowLocation}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Allow
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Skip
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                  <span className="text-xs text-gray-600">Locating...</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
