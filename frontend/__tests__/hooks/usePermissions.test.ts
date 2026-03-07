import { renderHook } from '@testing-library/react'
import { usePermissions } from '@/hooks/usePermissions'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import useSWR from 'swr'

vi.mock('swr', () => ({
    default: vi.fn(),
}))

const mockUseSWR = vi.mocked(useSWR)

describe('usePermissions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('admin ロールのとき isAdmin=true canWrite=true', () => {
        mockUseSWR.mockReturnValue({
            data: { id: 1, username: 'alice', role: 'admin', is_superadmin: false, created_at: '' },
            error: undefined,
            isLoading: false,
            isValidating: false,
            mutate: vi.fn(),
        } as ReturnType<typeof useSWR>)

        const { result } = renderHook(() => usePermissions())

        expect(result.current.isAdmin).toBe(true)
        expect(result.current.canWrite).toBe(true)
        expect(result.current.isViewer).toBe(false)
        expect(result.current.isMember).toBe(false)
    })

    it('member ロールのとき isMember=true canWrite=true', () => {
        mockUseSWR.mockReturnValue({
            data: { id: 2, username: 'bob', role: 'member', is_superadmin: false, created_at: '' },
            error: undefined,
            isLoading: false,
            isValidating: false,
            mutate: vi.fn(),
        } as ReturnType<typeof useSWR>)

        const { result } = renderHook(() => usePermissions())

        expect(result.current.isMember).toBe(true)
        expect(result.current.canWrite).toBe(true)
        expect(result.current.isAdmin).toBe(false)
        expect(result.current.isViewer).toBe(false)
    })

    it('viewer ロールのとき isViewer=true canWrite=false', () => {
        mockUseSWR.mockReturnValue({
            data: { id: 3, username: 'carol', role: 'viewer', is_superadmin: false, created_at: '' },
            error: undefined,
            isLoading: false,
            isValidating: false,
            mutate: vi.fn(),
        } as ReturnType<typeof useSWR>)

        const { result } = renderHook(() => usePermissions())

        expect(result.current.isViewer).toBe(true)
        expect(result.current.canWrite).toBe(false)
        expect(result.current.isAdmin).toBe(false)
        expect(result.current.isMember).toBe(false)
    })

    it('ローディング中のとき isLoading=true', () => {
        mockUseSWR.mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: true,
            isValidating: true,
            mutate: vi.fn(),
        } as ReturnType<typeof useSWR>)

        const { result } = renderHook(() => usePermissions())

        expect(result.current.isLoading).toBe(true)
        expect(result.current.isAdmin).toBe(false)
        expect(result.current.canWrite).toBe(false)
    })

    it('/family/members への SWR コールが発生しない', () => {
        mockUseSWR.mockReturnValue({
            data: { id: 1, username: 'alice', role: 'admin', is_superadmin: false, created_at: '' },
            error: undefined,
            isLoading: false,
            isValidating: false,
            mutate: vi.fn(),
        } as ReturnType<typeof useSWR>)

        renderHook(() => usePermissions())

        // useSWR は /auth/me の1回だけ呼ばれるはず
        expect(mockUseSWR).toHaveBeenCalledTimes(1)
        const firstCallKey = mockUseSWR.mock.calls[0][0]
        expect(firstCallKey).toBe('/auth/me')
        // /family/members が呼ばれていないことを確認
        const allKeys = mockUseSWR.mock.calls.map(call => call[0])
        expect(allKeys).not.toContain('/family/members')
    })
})
