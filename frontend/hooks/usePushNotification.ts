"use client";

import { useEffect, useState } from "react";

export function usePushNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported" as any);
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
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
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
