/**
 * Minimal service worker: makes the app installable (PWA). It does NOT cache anything on purpose:
 * data comes from the local server or the demo file, and a cache would show stale grades or old builds.
 * Requests go straight to the network, exactly as without the service worker.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {
  // No respondWith(): the browser handles every request normally.
});
