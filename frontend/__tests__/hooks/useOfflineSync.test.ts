import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOfflineSyncStore } from '../../stores/offlineSyncStore'

vi.mock('../../lib/api', () => ({
    api: {
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}))

vi.mock('swr', async () => {
    const mockMutate = vi.fn()
    return {
        default: vi.fn(),
        useSWRConfig: vi.fn(() => ({ mutate: mockMutate })),
    }
})

describe('useOfflineSync', () => {
    beforeEach(async () => {
        useOfflineSyncStore.getState().clearAll()
        vi.stubGlobal('crypto', {
            randomUUID: vi.fn()
                .mockReturnValueOnce('uuid-1')
                .mockReturnValueOnce('uuid-2')
                .mockReturnValueOnce('uuid-3'),
        })
        Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true })
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('初期状態でonlineであることを検出する', async () => {
        const { useOfflineSync } = await import('../../hooks/useOfflineSync')
        const { result } = renderHook(() => useOfflineSync())
        expect(result.current.isOnline).toBe(true)
    })

    it('pendingCountがキューのサイズと一致する', async () => {
        useOfflineSyncStore.getState().addOp({ endpoint: '/diapers/', method: 'POST', body: {} })
        const { useOfflineSync } = await import('../../hooks/useOfflineSync')
        const { result } = renderHook(() => useOfflineSync())
        expect(result.current.pendingCount).toBe(1)
    })

    it('offlineイベントでisOnlineがfalseになる', async () => {
        const { useOfflineSync } = await import('../../hooks/useOfflineSync')
        const { result } = renderHook(() => useOfflineSync())
        act(() => {
            window.dispatchEvent(new Event('offline'))
        })
        expect(result.current.isOnline).toBe(false)
    })

    it('onlineイベントでisOnlineがtrueになる', async () => {
        Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true })
        const { useOfflineSync } = await import('../../hooks/useOfflineSync')
        const { result } = renderHook(() => useOfflineSync())
        await act(async () => {
            window.dispatchEvent(new Event('online'))
        })
        expect(result.current.isOnline).toBe(true)
    })

    it('onlineイベントでPOSTキューがフラッシュされる', async () => {
        const { api } = await import('../../lib/api')
        vi.mocked(api.post).mockResolvedValue({ id: 1 })

        useOfflineSyncStore.getState().addOp({
            endpoint: '/diapers/',
            method: 'POST',
            body: { baby_id: 1 },
        })

        const { useOfflineSync } = await import('../../hooks/useOfflineSync')
        renderHook(() => useOfflineSync())

        await act(async () => {
            window.dispatchEvent(new Event('online'))
        })

        expect(api.post).toHaveBeenCalledWith('/diapers/', { baby_id: 1 })
        expect(useOfflineSyncStore.getState().pendingOps).toHaveLength(0)
    })

    it('APIエラー時は操作がキューに残る', async () => {
        const { api } = await import('../../lib/api')
        vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

        useOfflineSyncStore.getState().addOp({ endpoint: '/diapers/', method: 'POST', body: {} })

        const { useOfflineSync } = await import('../../hooks/useOfflineSync')
        renderHook(() => useOfflineSync())

        await act(async () => {
            window.dispatchEvent(new Event('online'))
        })

        expect(useOfflineSyncStore.getState().pendingOps).toHaveLength(1)
    })
})
