// Service Worker Cleanup Script
// Removes old service workers that cause redirect errors
(function() {
  if ('serviceWorker' in navigator) {
    // Unregister all service workers untuk fix redirect error
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      registrations.forEach(function(registration) {
        registration.unregister();
      });
    });
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        cacheNames.forEach(function(cacheName) {
          caches.delete(cacheName);
        });
      });
    }
  }
})();