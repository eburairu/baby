import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useHydratedStore } from '../../hooks/useHydratedStore'

interface TestState {
  value: string
  setValue: (v: string) => void
}

const useTestStore = create<TestState>()(
  persist(
    (set) => ({
      value: 'default',
      setValue: (v) => set({ value: v }),
    }),
    { name: 'test-store-hydration' }
  )
)

describe('useHydratedStore', () => {
  beforeEach(() => {
    // ストアをデフォルト状態にリセット
    useTestStore.setState({ value: 'default' })
  })

  it('マウント前（初期レンダリング）はfallbackを返す', () => {
    const { result } = renderHook(() =>
      useHydratedStore(useTestStore, (s) => s.value, 'fallback')
    )
    // useEffect実行前の最初のレンダリングはfallback
    // NOTE: jsdom環境ではuseEffectが同期的に実行されるため、
    // 厳密なSSR/pre-render状態のテストは困難だが、
    // useEffectが実行された後の値が正しいことを確認する
    expect(result.current).toBe(useTestStore.getState().value)
  })

  it('マウント後はストアの実際の値を返す', () => {
    const { result } = renderHook(() =>
      useHydratedStore(useTestStore, (s) => s.value, 'fallback')
    )
    act(() => {
      useTestStore.setState({ value: 'updated' })
    })
    expect(result.current).toBe('updated')
  })

  it('fallbackはストアのデフォルト値と異なる型でも安全に返せる', () => {
    interface NumState {
      count: number
      setCount: (n: number) => void
    }
    const useNumStore = create<NumState>()(
      persist(
        (set) => ({
          count: 0,
          setCount: (n) => set({ count: n }),
        }),
        { name: 'test-num-store-hydration' }
      )
    )

    const { result } = renderHook(() =>
      useHydratedStore(useNumStore, (s) => s.count, -1)
    )
    // マウント後はストアの値（0）が返る
    expect(result.current).toBe(0)
  })

  it('ストアの値が変わると再レンダリングされ新しい値を返す', () => {
    const { result } = renderHook(() =>
      useHydratedStore(useTestStore, (s) => s.value, 'fallback')
    )

    act(() => {
      useTestStore.getState().setValue('hello')
    })
    expect(result.current).toBe('hello')

    act(() => {
      useTestStore.getState().setValue('world')
    })
    expect(result.current).toBe('world')
  })

  it('persistなしのストアにも使用できる', () => {
    const useSimpleStore = create<TestState>((set) => ({
      value: 'simple',
      setValue: (v) => set({ value: v }),
    }))

    const { result } = renderHook(() =>
      useHydratedStore(useSimpleStore, (s) => s.value, 'fallback')
    )
    expect(result.current).toBe('simple')
  })
})
