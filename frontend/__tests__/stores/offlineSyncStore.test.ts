import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useOfflineSyncStore } from '../../stores/offlineSyncStore'

describe('useOfflineSyncStore', () => {
    beforeEach(() => {
        useOfflineSyncStore.getState().clearAll()
        vi.stubGlobal('crypto', {
            randomUUID: vi.fn()
                .mockReturnValueOnce('uuid-1')
                .mockReturnValueOnce('uuid-2')
                .mockReturnValueOnce('uuid-3'),
        })
    })

    it('初期状態ではpendingOpsが空である', () => {
        expect(useOfflineSyncStore.getState().pendingOps).toHaveLength(0)
    })

    it('addOpで操作をキューに追加してIDを返す', () => {
        const id = useOfflineSyncStore.getState().addOp({
            endpoint: '/diapers/',
            method: 'POST',
            body: { baby_id: 1, diaper_type: 'WET' },
        })
        expect(id).toBe('uuid-1')
        const ops = useOfflineSyncStore.getState().pendingOps
        expect(ops).toHaveLength(1)
        expect(ops[0].id).toBe('uuid-1')
        expect(ops[0].endpoint).toBe('/diapers/')
        expect(ops[0].method).toBe('POST')
        expect(ops[0].body).toEqual({ baby_id: 1, diaper_type: 'WET' })
        expect(ops[0].timestamp).toBeGreaterThan(0)
    })

    it('removeOpでIDを指定して操作を削除できる', () => {
        useOfflineSyncStore.getState().addOp({ endpoint: '/diapers/', method: 'POST', body: {} })
        expect(useOfflineSyncStore.getState().pendingOps).toHaveLength(1)
        useOfflineSyncStore.getState().removeOp('uuid-1')
        expect(useOfflineSyncStore.getState().pendingOps).toHaveLength(0)
    })

    it('存在しないIDでremoveOpしても他の操作は残る', () => {
        useOfflineSyncStore.getState().addOp({ endpoint: '/diapers/', method: 'POST', body: {} })
        useOfflineSyncStore.getState().removeOp('nonexistent-id')
        expect(useOfflineSyncStore.getState().pendingOps).toHaveLength(1)
    })

    it('clearAllでキューを空にできる', () => {
        useOfflineSyncStore.getState().addOp({ endpoint: '/diapers/', method: 'POST', body: {} })
        useOfflineSyncStore.getState().addOp({ endpoint: '/feeding/', method: 'POST', body: {} })
        useOfflineSyncStore.getState().clearAll()
        expect(useOfflineSyncStore.getState().pendingOps).toHaveLength(0)
    })

    it('複数の操作を追加順に保持する', () => {
        useOfflineSyncStore.getState().addOp({ endpoint: '/diapers/', method: 'POST', body: { type: 'WET' } })
        useOfflineSyncStore.getState().addOp({ endpoint: '/feeding/', method: 'POST', body: { ml: 100 } })
        const ops = useOfflineSyncStore.getState().pendingOps
        expect(ops).toHaveLength(2)
        expect(ops[0].endpoint).toBe('/diapers/')
        expect(ops[1].endpoint).toBe('/feeding/')
    })

    it('DELETEメソッドの操作も登録できる', () => {
        useOfflineSyncStore.getState().addOp({ endpoint: '/diapers/1', method: 'DELETE' })
        const ops = useOfflineSyncStore.getState().pendingOps
        expect(ops[0].method).toBe('DELETE')
        expect(ops[0].body).toBeUndefined()
    })
})
