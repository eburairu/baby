// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://df57b075f6f01f47246f03f44fb7f5d6@o4510904857526272.ingest.us.sentry.io/4510904861065216",

  // 本番環境では20%のみサンプリングしてネットワーク帯域を節約
  // 開発環境では100%サンプリングして問題を見逃さない
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // PII（個人識別情報）の送信を無効化
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});
