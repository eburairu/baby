"use client";

import { useEffect, useState } from "react";

export function usePushNotification() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    // 既存の購読状態をSWから読み込む
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        const reg = regs.find((r) => r.active) ?? regs[0];
        if (reg?.pushManager) {
          reg.pushManager.getSubscription().then((sub) => {
            if (sub) setSubscription(sub);
          });
        }
      });
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
      // getRegistrations() で全登録を取得し active なものを選ぶ
      // iOS PWA では getRegistration("/") がスコープ不一致で undefined を返すことがある
      const regs = await navigator.serviceWorker.getRegistrations();
      const existingReg = regs.find((r) => r.active) ?? regs[0];

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
        setSubscription(existingSubscription);
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

  const unsubscribeUser = async (sub: PushSubscription) => {
    try {
      await sub.unsubscribe();
      await fetch(
        `/api/notifications/unsubscribe?endpoint=${encodeURIComponent(sub.endpoint)}`,
        { method: "POST" }
      );
      setSubscription(null);
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      throw error;
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
    unsubscribeUser,
    sendSubscriptionToBackend,
  };
}
