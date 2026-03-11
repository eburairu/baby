"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service Worker registration failed:", err);
    });

    // オフライン移行時に Background Sync タグを登録する。
    // SW が起動したタイミングでオンライン復帰を検知し SYNC_REQUESTED をクライアントに送信する。
    const registerBackgroundSync = () => {
      navigator.serviceWorker.ready.then((registration) => {
        if ("sync" in registration) {
          (registration.sync as { register: (tag: string) => Promise<void> })
            .register("botoro-offline-sync")
            .catch(() => {
              // Background Sync 非対応ブラウザでは無視する（online イベントでフォールバック）
            });
        }
      });
    };

    window.addEventListener("offline", registerBackgroundSync);
    return () => {
      window.removeEventListener("offline", registerBackgroundSync);
    };
  }, []);

  return null;
}
