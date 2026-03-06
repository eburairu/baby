import { useState, useCallback } from 'react';

// Hydrationエラーを防ぐため、常に初回レンダリング時は initialValue を返し、
// 状態の初期化時に localStorage を読み込まない。
// 実際の利用側コンポーネント（TipsCardなど）が mounted 状態を管理し、
// クライアントサイドでのみ安全に表示を切り替えるようにする方針は、
// useSyncExternalStore を使わない限り困難（Next.js SSRの性質上）。
// ここでは、"プレーンテキストとして保存されている既存データとの後方互換性"を保ちつつ、
// シンプルに読み書きするラッパーとしての役割に特化させます。

export function useLocalStorage<T extends string>(key: string, initialValue: T) {
  // サーバーサイドでは initialValue、クライアントサイドでは localStorage の値（あれば）で初期化
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // 既存のプレーンテキスト（例: "trend", "closed"）をそのままパースせずに返す
      return item ? (item as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 状態とlocalStorageの同期
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        // JSON.stringify せずにそのまま保存する（プレーンテキストとしての互換性維持）
        window.localStorage.setItem(key, String(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}
