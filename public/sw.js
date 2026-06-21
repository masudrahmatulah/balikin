// ============================================================================
// FASE 5: PWA Service Worker untuk Push Notifications
// ============================================================================
//
// Service worker ini menangani:
// 1. Cache management untuk offline capability
// 2. Push notification handling
// 3. Background sync untuk chat notifications
// ============================================================================

const CACHE_NAME = 'balikin-v1';
const OFFLINE_CACHE = 'balikin-offline-v1';

// Aset yang akan di-cache untuk offline access
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ============================================================================
// INSTALL EVENT
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

// ============================================================================
// ACTIVATE EVENT
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// ============================================================================
// FETCH EVENT (Offline Support)
// ============================================================================

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip caching for API routes and WebSocket
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/_next/') ||
    event.request.url.includes('supabase')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Return offline page for HTML requests
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/') || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        }
      });
    })
  );
});

// ============================================================================
// PUSH NOTIFICATION EVENT
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);

  let notificationData = {
    title: 'Balikin Notification',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'balikin-notification',
    data: {
      url: '/dashboard',
      timestamp: Date.now(),
    },
  };

  // Parse push data
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
      };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
    }
  }

  // Tampilkan notifikasi
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'Lihat',
          icon: '/icons/icon-96x96.png',
        },
        {
          action: 'close',
          title: 'Tutup',
          icon: '/icons/icon-96x96.png',
        },
      ],
    })
  );
});

// ============================================================================
// NOTIFICATION CLICK EVENT
// ============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Default action: open app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
        if (client.url.includes(event.notification.data?.url || '/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }

      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data?.url || '/dashboard');
      }
    })
  );
});

// ============================================================================
// BACKGROUND SYNC (untuk queue notification saat offline)
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'chat-notifications') {
    event.waitUntil(handleChatNotificationSync());
  }
});

async function handleChatNotificationSync() {
  try {
    // Sync pending notifications dengan server
    const response = await fetch('/api/sync-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      console.log('[SW] Chat notifications synced successfully');
    }
  } catch (error) {
    console.error('[SW] Failed to sync chat notifications:', error);
  }
}

// ============================================================================
// MESSAGE EVENT (dari client)
// ============================================================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received from client:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// ============================================================================
// PERIODIC SYNC (untuk cek pesan baru secara berkala)
// ============================================================================

// Note: Periodic Sync API memerlukan permission khusus
// Ini adalah placeholder untuk implementasi future

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-unread-messages') {
    event.waitUntil(checkUnreadMessages());
  }
});

async function checkUnreadMessages() {
  try {
    // Cek unread messages dari server
    const response = await fetch('/api/chat/unread-count');
    const data = await response.json();

    if (data.count > 0) {
      // Tampilkan badge pada icon
      // (memerlukan implementation badge API)
      console.log('[SW] Unread messages:', data.count);
    }
  } catch (error) {
    console.error('[SW] Failed to check unread messages:', error);
  }
}

console.log('[SW] Service Worker loaded successfully');
