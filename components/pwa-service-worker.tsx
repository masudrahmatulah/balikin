"use client";

import { useEffect } from 'react';
import { useServiceWorker, usePWAInstall } from '@/lib/pwa';

/**
 * FASE 5: PWA Service Worker Registration Component
 *
 * Component ini mendaftarkan service worker dan menampilkan prompt instalasi
 * jika aplikasi dapat di-install sebagai PWA.
 */
export function PWAServiceWorker() {
  const { isSupported, isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const { isInstallable, promptInstall } = usePWAInstall();

  useEffect(() => {
    // Request notification permission saat user pertama kali interaksi
    const handleInteraction = () => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            console.log('[PWA] Notification permission granted');
          }
        });
      }
      // Remove listener after first interaction
      document.removeEventListener('click', handleInteraction);
    };

    document.addEventListener('click', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
    };
  }, []);

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Update Available Banner */}
      {isUpdateAvailable && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-blue-600 text-white text-center shadow-lg">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm">Versi baru tersedia!</span>
            <button
              onClick={updateServiceWorker}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
            >
              Update Sekarang
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg font-medium text-sm hover:bg-blue-800 transition-colors"
            >
              Nanti
            </button>
          </div>
        </div>
      )}

      {/* Install PWA Prompt - Only show in specific pages or via manual trigger */}
      {isInstallable && (
        <div id="pwa-install-prompt" className="hidden">
          {/* Hidden by default, can be triggered via button */}
          <button onClick={promptInstall} className="pwa-install-btn">
            Install App
          </button>
        </div>
      )}
    </>
  );
}
