"use client";

import { useEffect, useState } from "react";

export function usePushNotification() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported";
    }
    try {
      const status = await Notification.requestPermission();
      setPermission(status);
      return status;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "default";
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeUser = async (vapidPublicKey: string) => {
    if (!("serviceWorker" in navigator)) return null;

    try {
      // まず登録済み SW を確認する（ready より先に呼ぶことで「未登録」を即座に検出）
      const existingReg = await navigator.serviceWorker.getRegistration("/");
      if (!existingReg) {
        throw new Error(
          "Service Worker が登録されていません。ページを再読み込みして再試行してください。"
        );
      }

      // active な SW が既にあればそのまま使う。インストール中の場合のみ ready を待機する
      const registration = existingReg.active
        ? existingReg
        : await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<never>((_, reject) =>
              setTimeout(
                () =>
                  reject(
                    new Error(
                      "Service Worker の準備がタイムアウトしました。ページを再読み込みして再試行してください。"
                    )
                  ),
                20000
              )
            ),
          ]);

      if (!registration.pushManager) {
        throw new Error("プッシュ通知はこのブラウザ/環境では使用できません（PushManager が見つかりません）。");
      }
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        await sendSubscriptionToBackend(existingSubscription);
        return existingSubscription;
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      setSubscription(newSubscription);
      return newSubscription;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Failed to subscribe user:", msg);
      throw new Error(msg);
    }
  };

  const sendSubscriptionToBackend = async (subscription: PushSubscription) => {
    const keys = subscription.toJSON().keys;
    if (!keys || !keys.p256dh || !keys.auth) return;

    try {
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send subscription to backend");
      }
    } catch (error) {
      console.error("Error sending subscription to backend:", error);
    }
  };

  return {
    permission,
    subscription,
    requestPermission,
    subscribeUser,
    sendSubscriptionToBackend,
  };
}
