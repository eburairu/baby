import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// ---- モック宣言 ----
const mockSetSelectedBabyId = vi.fn()
let mockRawSelectedBabyId: string | null = null
let mockHydratedSelectedBabyId: string | null = null

vi.mock('@/hooks/useBabies', () => ({
    useBabies: vi.fn(),
}))

vi.mock('@/stores/babyStore', () => ({
    useBabyStore: vi.fn(),
}))

vi.mock('@/hooks/useHydratedStore', () => ({
    useHydratedStore: vi.fn(),
}))

// ---- モジュールのインポート（vi.mock の後） ----
import { useBabies } from '@/hooks/useBabies'
import { useBabyStore } from '@/stores/babyStore'
import { useHydratedStore } from '@/hooks/useHydratedStore'
import { useSelectedBaby } from '../useSelectedBaby'

const BABIES = [
    { id: 1, name: 'Baby A', birthday: '2024-01-01', family_id: 1, created_at: '', updated_at: '' },
    { id: 2, name: 'Baby B', birthday: '2024-06-01', family_id: 1, created_at: '', updated_at: '' },
]

// useBabyStore(selector) は呼ばれ方によって rawSelectedBabyId か setSelectedBabyId を返す
function setupBabyStoreMock() {
    ;(useBabyStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector: ((s: { selectedBabyId: string | null; setSelectedBabyId: typeof mockSetSelectedBabyId }) => unknown) | undefined) => {
            const state = {
                selectedBabyId: mockRawSelectedBabyId,
                setSelectedBabyId: mockSetSelectedBabyId,
            }
            return typeof selector === 'function' ? selector(state) : state
        }
    )
}

beforeEach(() => {
    vi.clearAllMocks()
    mockRawSelectedBabyId = null
    mockHydratedSelectedBabyId = null

    ;(useBabies as ReturnType<typeof vi.fn>).mockReturnValue({
        babies: BABIES,
        isLoading: false,
        isError: false,
        mutate: vi.fn(),
    })

    // useHydratedStore はハイドレーション前 null を返す（デフォルト）
    ;(useHydratedStore as ReturnType<typeof vi.fn>).mockImplementation(
        (_store: unknown, _selector: unknown, fallback: unknown) =>
            mockHydratedSelectedBabyId ?? fallback
    )

    setupBabyStoreMock()
})

describe('useSelectedBaby', () => {
    describe('ストアが空のとき（初回利用）', () => {
        it('babies[0].id をストアに保存する', () => {
            // rawSelectedBabyId = null（本当に未選択）
            mockRawSelectedBabyId = null
            mockHydratedSelectedBabyId = null
            setupBabyStoreMock()

            renderHook(() => useSelectedBaby())

            expect(mockSetSelectedBabyId).toHaveBeenCalledWith('1')
        })
    })

    describe('ストアに Baby B の ID が保存されているとき', () => {
        it('ハイドレーション前でも Baby B の選択をストアで上書きしない（バグ再現シナリオ）', () => {
            // rawSelectedBabyId = '2'（localStorage から同期読み込み済み）
            // ただし useHydratedStore はまだ null を返す（ハイドレーション前）
            mockRawSelectedBabyId = '2'
            mockHydratedSelectedBabyId = null
            setupBabyStoreMock()

            renderHook(() => useSelectedBaby())

            // babies[0].id（= '1'）で上書きされないこと
            expect(mockSetSelectedBabyId).not.toHaveBeenCalled()
        })

        it('ハイドレーション完了後は Baby B が selectedBabyId として返される', () => {
            mockRawSelectedBabyId = '2'
            mockHydratedSelectedBabyId = '2'
            setupBabyStoreMock()

            const { result } = renderHook(() => useSelectedBaby())

            expect(result.current.selectedBabyId).toBe('2')
        })
    })

    describe('記録ページから戻ったシナリオ（バグ再現）', () => {
        it('記録ページで Baby B を選択後にダッシュボードへ戻っても選択がリセットされない', () => {
            // 記録ページの useRecordPage が setSelectedBabyId('2') を呼んだ後の状態
            mockRawSelectedBabyId = '2'
            // ダッシュボードマウント直後: useHydratedStore はまだ null
            mockHydratedSelectedBabyId = null
            setupBabyStoreMock()

            renderHook(() => useSelectedBaby())

            // Baby A（babies[0]）でストアを上書きしないこと
            expect(mockSetSelectedBabyId).not.toHaveBeenCalledWith('1')
            expect(mockSetSelectedBabyId).not.toHaveBeenCalled()
        })
    })

    describe('デフォルト選択の永続化', () => {
        it('ストアに値がある場合はデフォルト設定を行わない', () => {
            mockRawSelectedBabyId = '1'
            mockHydratedSelectedBabyId = '1'
            setupBabyStoreMock()

            renderHook(() => useSelectedBaby())

            expect(mockSetSelectedBabyId).not.toHaveBeenCalled()
        })
    })
})
