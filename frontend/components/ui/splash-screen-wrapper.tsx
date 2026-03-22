"use client"

import dynamic from "next/dynamic"

// framer-motion は SSG 時に Hydration mismatch を起こすため ssr: false で動的インポート
// 静的スプラッシュ（#initial-splash）が JS ロード前のフラッシュを防ぐ
const SplashScreen = dynamic(
  () => import("./splash-screen").then((m) => ({ default: m.SplashScreen })),
  { ssr: false }
)

export function SplashScreenWrapper() {
  return <SplashScreen />
}
