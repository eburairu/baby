import type { NextConfig } from "next";

import nextPWA from "@ducanh2912/next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
});

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "radix-ui",
      "@radix-ui/react-checkbox",
      "zod",
      "zustand",
      "sonner",
      "framer-motion"
    ],
  },
};

export default withSentryConfig(withPWA(nextConfig), {
  org: "takuro-ebuchi",
  project: "baby-app-next",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
});