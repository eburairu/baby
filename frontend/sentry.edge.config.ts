// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://df57b075f6f01f47246f03f44fb7f5d6@o4510904857526272.ingest.us.sentry.io/4510904861065216",

  // 本番環境では20%のみサンプリングしてネットワーク帯域を節約
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // PII（個人識別情報）の送信を無効化
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});
