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

// Background Sync: オフライン中にキューされた書き込みをオンライン復帰後に同期する。
// クライアント側の localStorage ベースのキューをフラッシュするため、
// 全ウィンドウに SYNC_REQUESTED メッセージを送信して useOfflineSync フックを起動する。
self.addEventListener('sync', (event) => {
  if (event.tag === 'botoro-offline-sync') {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'SYNC_REQUESTED' }));
      })
    );
  }
});
