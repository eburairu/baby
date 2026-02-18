/**
 * Push通知購読のデバッグスクリプト
 * 使い方: node debug-push-notification.mjs <email> <password>
 */
import { chromium } from "playwright";

const BASE_URL = "https://baby-app-next.onrender.com";
const [, , EMAIL, PASSWORD] = process.argv;

if (!EMAIL || !PASSWORD) {
  console.error("Usage: node debug-push-notification.mjs <email> <password>");
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    permissions: ["notifications"],
  });
  const page = await context.newPage();

  // コンソールログを全て収集
  const logs = [];
  page.on("console", (msg) => {
    const entry = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    logs.push(entry);
    if (msg.type() === "error" || msg.text().includes("push") || msg.text().includes("subscribe") || msg.text().includes("vapid") || msg.text().includes("VAPID") || msg.text().includes("worker") || msg.text().includes("Worker")) {
      console.log("🔍", entry);
    }
  });

  page.on("pageerror", (err) => {
    console.log("❌ PAGE ERROR:", err.message);
  });

  console.log("1. ログインページへ移動...");
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");

  console.log("2. ログイン中（APIを直接呼び出し）...");
  const loginRes = await page.request.post(`${BASE_URL}/api/auth/login`, {
    data: { username: EMAIL, password: PASSWORD },
  });
  console.log("   ログイン結果:", loginRes.status(), await loginRes.text().catch(() => ""));
  // Cookieをコンテキストに設定
  await page.reload();
  await page.waitForLoadState("networkidle");
  console.log("   現在のURL:", page.url());

  console.log("3. 通知設定ページへ移動...");
  await page.goto(`${BASE_URL}/settings/notifications`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // VAPID公開鍵が埋め込まれているか確認
  const vapidKey = await page.evaluate(() => {
    return "NOT ACCESSIBLE FROM BROWSER";
  });
  console.log("4. VAPID公開鍵 (window):", vapidKey);

  // Service Worker の状態確認
  const swInfo = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return { supported: false };
    const registrations = await navigator.serviceWorker.getRegistrations();
    return {
      supported: true,
      registrationCount: registrations.length,
      registrations: registrations.map((r) => ({
        scope: r.scope,
        activeState: r.active?.state ?? null,
        installingState: r.installing?.state ?? null,
        waitingState: r.waiting?.state ?? null,
        activeScriptURL: r.active?.scriptURL ?? null,
      })),
    };
  });
  console.log("5. Service Worker状態:", JSON.stringify(swInfo, null, 2));

  // SWがactiveになるまで最大30秒待機してから購読を試みる
  console.log("6. ServiceWorker.ready 待機（最大30秒）...");
  const pushInfo = await page.evaluate(async (vapidKey) => {
    if (!("serviceWorker" in navigator)) return { error: "serviceWorker not supported" };
    try {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error("serviceWorker.ready timeout after 30s")), 30000))
      ]);
      if (!reg.pushManager) return { error: "pushManager not available" };

      // 既存購読を確認
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        return { result: "already subscribed", endpoint: existing.endpoint.slice(0, 60) + "..." };
      }

      // 購読を試みる
      const keyBytes = (() => {
        const base64 = (vapidKey + "=".repeat((4 - vapidKey.length % 4) % 4))
          .replace(/-/g, "+").replace(/_/g, "/");
        const raw = atob(base64);
        const arr = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
        return arr;
      })();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes,
      });
      return { result: "success", endpoint: sub.endpoint.slice(0, 60) + "..." };
    } catch (e) {
      return { error: e.message, name: e.name };
    }
  }, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "YOUR_VAPID_PUBLIC_KEY_HERE");
  console.log("7. 購読テスト結果:", JSON.stringify(pushInfo, null, 2));

  console.log("\n=== 全コンソールログ ===");
  logs.forEach((l) => console.log(l));

  await browser.close();
})();
