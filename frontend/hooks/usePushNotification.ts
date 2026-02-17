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
    if (!("Notification" in window)) return "unsupported";
    const status = await Notification.requestPermission();
    setPermission(status);
    return status;
  };

  const subscribeUser = async (vapidPublicKey: string) => {
    if (!("serviceWorker" in navigator)) return null;

    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription) {
      return existingSubscription;
    }

    try {
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });
      setSubscription(newSubscription);
      return newSubscription;
    } catch (error) {
      console.error("Failed to subscribe user:", error);
      return null;
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
