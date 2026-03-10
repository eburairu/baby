// Minimal service worker for push notifications.
// This file is committed to git because @ducanh2912/next-pwa does not generate
// sw.js under Turbopack + static export builds.
//
// NOTE: Do NOT add build-specific precache entries here.
//       Precaching versioned Next.js chunks causes SW install failure
//       whenever the build ID changes (workbox reports 404 -> SW never activates).

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Push notification handler (handles push events and notification clicks)
importScripts('/worker-1e999a0f776a11db.js');
