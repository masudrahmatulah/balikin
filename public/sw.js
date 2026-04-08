const CACHE_NAME = 'balikin-v2'; // Increment version to force cache refresh
const urlsToCache = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Don't cache API requests - they need to always go to network
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return a network error response if fetch fails
        return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  // Don't cache auth-related requests - always go to network with error handling
  if (event.request.url.includes('/auth/') || event.request.url.includes('/sign-in') || event.request.url.includes('/sign-up') || event.request.url.includes('/verify-otp')) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        // For auth pages, try to return a basic response or network error
        console.warn('[SW] Auth request failed:', error);
        return new Response('Network error - please refresh', { status: 503 });
      })
    );
    return;
  }

  // Skip non-GET requests (POST, PUT, DELETE, etc.) - pass through to network with error handling
  if (event.request.method !== 'GET') {
    event.respondWith(
      fetch(event.request).catch((error) => {
        console.warn('[SW] Non-GET request failed:', error);
        return new Response('Network error', { status: 503 });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch((error) => {
          // Network request failed - try to return from cache if available
          console.warn('[SW] Network request failed, trying cache:', error);
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cache available, return a basic offline response
            return new Response('Offline - Network unavailable', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
