// ============================================================================
// FASE 5: PWA Service Worker Registration & Push Notifications
// ============================================================================

import { useEffect, useRef, useState } from 'react';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Hook untuk mendeteksi dan menghandle PWA install prompt
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      const prompt = e as any;
      setDeferredPrompt(prompt);
      setIsInstallable(true);
      console.log('[PWA] Install prompt detected');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }

      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('[PWA] Error prompting install:', error);
    }
  };

  return { isInstallable, promptInstall };
}

/**
 * Hook untuk mendaftarkan service worker
 */
export function useServiceWorker() {
  const [registration, setRegistration] = useState<globalThis.ServiceWorkerRegistration | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const reloadOnControllerChange = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service workers are not supported');
      return;
    }

    setIsSupported(true);
    let disposed = false;
    let hasReloaded = false;
    let currentWorker: ServiceWorker | null = null;

    const handleControllerChange = () => {
      if (!reloadOnControllerChange.current || hasReloaded) return;
      hasReloaded = true;
      window.location.reload();
    };
    const handleUpdateFound = () => {
      currentWorker?.removeEventListener('statechange', handleWorkerStateChange);
      currentWorker = registration?.installing ?? null;
      currentWorker?.addEventListener('statechange', handleWorkerStateChange);
    };
    const handleWorkerStateChange = () => {
      if (currentWorker?.state === 'installed' && navigator.serviceWorker.controller) {
        setIsUpdateAvailable(true);
      }
    };

    let registration: ServiceWorkerRegistration | null = null;
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      if (disposed) return;
      registration = reg;
      setRegistration(reg);
      reg.addEventListener('updatefound', handleUpdateFound);
      if (reg.waiting && navigator.serviceWorker.controller) setIsUpdateAvailable(true);
    }).catch((error) => {
      console.error('[SW] Service worker registration failed:', error);
    });

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      registration?.removeEventListener('updatefound', handleUpdateFound);
      currentWorker?.removeEventListener('statechange', handleWorkerStateChange);
    };
  }, []);

  const updateServiceWorker = async () => {
    if (!registration || !registration.waiting) {
      return;
    }

    // Send message to waiting service worker to skip waiting
    // Only an explicitly accepted update may cause one reload on controllerchange.
    reloadOnControllerChange.current = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    setIsUpdateAvailable(false);
  };

  const unregisterServiceWorker = async () => {
    if (registration) {
      await registration.unregister();
      setRegistration(null);
      console.log('[SW] Service worker unregistered');
    }
  };

  return {
    isSupported,
    isUpdateAvailable,
    updateServiceWorker,
    unregisterServiceWorker,
  };
}

/**
 * Request notification permission dan subscribe to push
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return false;
  }

  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    console.log('[PWA] Notification permission granted');
    return true;
  }

  console.log('[PWA] Notification permission denied');
  return false;
}

/**
 * Subscribe to push notifications
 * Note: Memerlukan VAPID public key dari server
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    console.log('[PWA] Push subscription created:', subscription);

    // Kirim subscription ke server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error('[PWA] Failed to subscribe to push:', error);
    return null;
  }
}

/**
 * Tampilkan notifikasi lokal (fallback untuk tanpa push)
 */
export function showLocalNotification(options: {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon || '/icons/icon-192x192.png',
    tag: options.tag || 'balikin-notification',
  });

  notification.onclick = () => {
    window.focus();
    options.onClick?.();
    notification.close();
  };
}
