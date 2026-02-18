// frontend/worker/index.ts
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener("push", (event) => {
  const data = event.data ? JSON.parse(event.data.text()) : {};
  const title = data.title || "Baby App";
  const body = data.body || "新しい通知があります。";
  const url = data.url || "/";

  const options: NotificationOptions = {
    body,
    icon: "/icons/icon-192x192.svg",
    badge: "/favicon.ico",
    data: {
      url,
    },
  };

  event.waitUntil(sw.registration.showNotification(title, options));
});

sw.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data.url;

  event.waitUntil(
    sw.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (sw.clients.openWindow) return sw.clients.openWindow(url);
    })
  );
});
