import { create } from 'zustand'

export type FeedingSide = 'LEFT' | 'RIGHT' | null

interface FeedingTimerState {
  activeSide: FeedingSide
  leftElapsedSeconds: number
  rightElapsedSeconds: number
  segmentStartTime: Date | null
  start: (side: FeedingSide) => void
  stop: () => void
  sync: (
    activeSide: FeedingSide,
    leftElapsed: number,
    rightElapsed: number,
    segmentStartTime: string | Date | null
  ) => void
  tick: () => void
  reset: () => void
  setLeftSeconds: (seconds: number) => void
  setRightSeconds: (seconds: number) => void
}

export const useFeedingTimerStore = create<FeedingTimerState>((set, get) => ({
  activeSide: null,
  leftElapsedSeconds: 0,
  rightElapsedSeconds: 0,
  segmentStartTime: null,

  start: (side) => {
    if (!side) return
    set({
      activeSide: side,
      segmentStartTime: new Date(),
    })
  },

  stop: () => {
    const { activeSide, segmentStartTime, leftElapsedSeconds, rightElapsedSeconds } = get()
    if (!activeSide || !segmentStartTime) {
      set({
        activeSide: null,
        segmentStartTime: null,
      })
      return
    }

    const now = new Date()
    const elapsed = Math.round((now.getTime() - segmentStartTime.getTime()) / 1000)

    if (activeSide === 'LEFT') {
      set({
        activeSide: null,
        segmentStartTime: null,
        leftElapsedSeconds: leftElapsedSeconds + elapsed,
      })
    } else {
      set({
        activeSide: null,
        segmentStartTime: null,
        rightElapsedSeconds: rightElapsedSeconds + elapsed,
      })
    }
  },

  sync: (activeSide, leftElapsed, rightElapsed, segmentStartTime) => {
    let startTimeDate: Date | null = null
    if (segmentStartTime) {
      startTimeDate =
        typeof segmentStartTime === 'string'
          ? new Date(segmentStartTime)
          : segmentStartTime
    }

    let extraLeft = 0
    let extraRight = 0
    let nowForNextSegment: Date | null = null

    if (activeSide && startTimeDate) {
      const now = new Date()
      const elapsed = Math.round((now.getTime() - startTimeDate.getTime()) / 1000)
      if (activeSide === 'LEFT') {
        extraLeft = elapsed
      } else {
        extraRight = elapsed
      }
      // クライアント時刻を次の計測セグメントの開始点にする
      nowForNextSegment = now
    }

    set({
      activeSide,
      leftElapsedSeconds: leftElapsed + extraLeft,
      rightElapsedSeconds: rightElapsed + extraRight,
      segmentStartTime: nowForNextSegment || startTimeDate,
    })
  },

  tick: () => {
    const { activeSide, segmentStartTime, leftElapsedSeconds, rightElapsedSeconds } = get()
    if (!activeSide || !segmentStartTime) return

    const now = new Date()
    const elapsed = Math.round((now.getTime() - segmentStartTime.getTime()) / 1000)

    if (activeSide === 'LEFT') {
      set({ leftElapsedSeconds: leftElapsedSeconds + elapsed, segmentStartTime: now })
    } else if (activeSide === 'RIGHT') {
      set({ rightElapsedSeconds: rightElapsedSeconds + elapsed, segmentStartTime: now })
    }
  },

  reset: () => {
    set({
      activeSide: null,
      leftElapsedSeconds: 0,
      rightElapsedSeconds: 0,
      segmentStartTime: null,
    })
  },

  setLeftSeconds: (seconds: number) => {
    const { activeSide } = get()
    set({
      leftElapsedSeconds: seconds,
      // タイマー稼働中ならセグメント開始時刻をリセットして跳ねを防止
      segmentStartTime: activeSide ? new Date() : get().segmentStartTime,
    })
  },

  setRightSeconds: (seconds: number) => {
    const { activeSide } = get()
    set({
      rightElapsedSeconds: seconds,
      segmentStartTime: activeSide ? new Date() : get().segmentStartTime,
    })
  },
}))
