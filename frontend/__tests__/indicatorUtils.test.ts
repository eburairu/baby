import { describe, it, expect, afterEach, vi } from 'vitest'
import { calcProgress, getIndicatorColor, isOverThreshold, INDICATOR_COLORS } from '@/lib/indicatorUtils'

describe('indicatorUtils', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('calcProgress', () => {
    it('lastRecordTimeISO が null のとき 0 を返す', () => {
      expect(calcProgress(null, 120)).toBe(0)
    })

    it('経過60分, 閾値120分 → 0.5', () => {
      vi.setSystemTime(new Date('2024-05-20T11:00:00Z'))
      expect(calcProgress('2024-05-20T10:00:00Z', 120)).toBeCloseTo(0.5)
    })

    it('経過120分, 閾値120分 → 1.0（ちょうど閾値）', () => {
      vi.setSystemTime(new Date('2024-05-20T12:00:00Z'))
      expect(calcProgress('2024-05-20T10:00:00Z', 120)).toBeCloseTo(1.0)
    })

    it('経過180分, 閾値120分 → 1.5（閾値超過でも生値を返す）', () => {
      vi.setSystemTime(new Date('2024-05-20T13:00:00Z'))
      expect(calcProgress('2024-05-20T10:00:00Z', 120)).toBeCloseTo(1.5)
    })

    it('nowISO を指定した場合はそちらを現在時刻として使用する', () => {
      const result = calcProgress('2024-05-20T10:00:00Z', 120, '2024-05-20T11:00:00Z')
      expect(result).toBeCloseTo(0.5)
    })

    it('経過0分のとき 0 を返す', () => {
      vi.setSystemTime(new Date('2024-05-20T10:00:00Z'))
      expect(calcProgress('2024-05-20T10:00:00Z', 120)).toBeCloseTo(0)
    })
  })

  describe('getIndicatorColor', () => {
    it('progress=0 → green', () => {
      expect(getIndicatorColor(0)).toBe('green')
    })

    it('progress=0.59 → green', () => {
      expect(getIndicatorColor(0.59)).toBe('green')
    })

    it('progress=0.6 → yellow', () => {
      expect(getIndicatorColor(0.6)).toBe('yellow')
    })

    it('progress=0.79 → yellow', () => {
      expect(getIndicatorColor(0.79)).toBe('yellow')
    })

    it('progress=0.8 → red', () => {
      expect(getIndicatorColor(0.8)).toBe('red')
    })

    it('progress=1.0 → red', () => {
      expect(getIndicatorColor(1.0)).toBe('red')
    })

    it('progress=1.5 → red（閾値超過）', () => {
      expect(getIndicatorColor(1.5)).toBe('red')
    })
  })

  describe('isOverThreshold', () => {
    it('progress=0.99 → false', () => {
      expect(isOverThreshold(0.99)).toBe(false)
    })

    it('progress=1.0 → true', () => {
      expect(isOverThreshold(1.0)).toBe(true)
    })

    it('progress=1.5 → true', () => {
      expect(isOverThreshold(1.5)).toBe(true)
    })
  })

  describe('INDICATOR_COLORS', () => {
    it('green, yellow, red の3色定数が文字列として存在する', () => {
      expect(typeof INDICATOR_COLORS.green).toBe('string')
      expect(typeof INDICATOR_COLORS.yellow).toBe('string')
      expect(typeof INDICATOR_COLORS.red).toBe('string')
    })
  })
})
