import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PendingOperation {
    id: string
    endpoint: string
    method: 'POST' | 'PATCH' | 'DELETE'
    body?: unknown
    timestamp: number
}

interface OfflineSyncStore {
    pendingOps: PendingOperation[]
    addOp: (op: Omit<PendingOperation, 'id' | 'timestamp'>) => string
    removeOp: (id: string) => void
    clearAll: () => void
}

export const useOfflineSyncStore = create<OfflineSyncStore>()(
    persist(
        (set) => ({
            pendingOps: [],
            addOp: (op) => {
                const id = crypto.randomUUID()
                const pending: PendingOperation = { ...op, id, timestamp: Date.now() }
                set((state) => ({ pendingOps: [...state.pendingOps, pending] }))
                return id
            },
            removeOp: (id) =>
                set((state) => ({
                    pendingOps: state.pendingOps.filter((op) => op.id !== id),
                })),
            clearAll: () => set({ pendingOps: [] }),
        }),
        { name: 'offline-sync-store' }
    )
)
