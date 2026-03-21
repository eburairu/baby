import { useState, useEffect } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'

/**
 * Zustand の persist ミドルウェアを使ったストアで
 * Next.js のハイドレーションエラーを防ぐためのフック。
 *
 * SSR/静的出力では localStorage が存在しないため、サーバーと
 * クライアントの初期レンダリング結果が一致するよう、
 * コンポーネントがマウントされるまで fallback を返す。
 * マウント後（useEffect実行後）はストアの実際の値を返す。
 *
 * @example
 * // Before (hydration mismatch risk):
 * const { selectedBabyId } = useBabyStore()
 *
 * // After (safe):
 * const selectedBabyId = useHydratedStore(useBabyStore, (s) => s.selectedBabyId, null)
 */
export function useHydratedStore<T, F>(
  store: UseBoundStore<StoreApi<T>>,
  selector: (state: T) => F,
  fallback: F
): F {
  const [isHydrated, setIsHydrated] = useState(false)
  const value = store(selector)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true)
  }, [])

  return isHydrated ? value : fallback
}
