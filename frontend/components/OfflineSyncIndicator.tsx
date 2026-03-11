"use client";

import { useOfflineSync } from "@/hooks/useOfflineSync";

/**
 * オフライン状態と同期待ちキューをグローバルに管理するコンポーネント。
 * layout.tsx にマウントしてアプリ全体で useOfflineSync を動作させる。
 * pendingCount が 0 より大きい場合、画面下部に同期待ちバナーを表示する。
 */
export function OfflineSyncIndicator() {
  const { isOnline, pendingCount } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all"
      style={{
        backgroundColor: isOnline ? "hsl(var(--primary))" : "#6b7280",
        color: "#fff",
      }}
    >
      {isOnline
        ? `同期中... (${pendingCount}件)`
        : pendingCount > 0
          ? `オフライン — ${pendingCount}件の記録を同期待ち`
          : "オフライン"}
    </div>
  );
}
