import { useEffect, useState, useCallback } from 'react'
import { useSWRConfig } from 'swr'
import { api } from '@/lib/api'
import { useOfflineSyncStore, type PendingOperation } from '@/stores/offlineSyncStore'
import { useHydratedStore } from '@/hooks/useHydratedStore'

/**
 * オフライン状態を検出し、復帰時にキューをフラッシュするフック。
 * アプリのルートに一度だけマウントすることを想定。
 */
export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    )
    const pendingOps = useHydratedStore(
        useOfflineSyncStore,
        (s) => s.pendingOps,
        [] as PendingOperation[]
    )
    const removeOp = useOfflineSyncStore((s) => s.removeOp)
    const { mutate } = useSWRConfig()

    const flush = useCallback(async () => {
        const ops = useOfflineSyncStore.getState().pendingOps
        if (ops.length === 0) return

        for (const op of ops) {
            try {
                if (op.method === 'POST') {
                    await api.post(op.endpoint, op.body)
                } else if (op.method === 'PATCH') {
                    await api.patch(op.endpoint, op.body)
                } else if (op.method === 'DELETE') {
                    await api.delete(op.endpoint)
                }
                useOfflineSyncStore.getState().removeOp(op.id)
            } catch {
                // 失敗した操作はキューに残し、次回オンライン復帰時に再試行する
            }
        }

        // キューをフラッシュ後、全SWRキャッシュを再検証して最新データを取得する
        mutate(() => true, undefined, { revalidate: true })
    }, [mutate])

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            void flush()
        }
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [flush])

    // Service WorkerからのSYNC_REQUESTEDメッセージを受信してフラッシュする
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SYNC_REQUESTED') {
                void flush()
            }
        }

        navigator.serviceWorker.addEventListener('message', handleMessage)
        return () => {
            navigator.serviceWorker.removeEventListener('message', handleMessage)
        }
    }, [flush])

    return {
        isOnline,
        pendingCount: pendingOps.length,
        flush,
        removeOp,
    }
}
