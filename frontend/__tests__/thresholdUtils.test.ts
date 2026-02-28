import { describe, it, expect } from 'vitest'
import { resolveThreshold } from '@/lib/thresholdUtils'

describe('resolveThreshold', () => {
  describe('feeding — WHOガイドライン閾値（カスタムなし）', () => {
    it('生後0ヶ月は 120分 を返す', () => {
      expect(resolveThreshold(0, null, 'feeding')).toBe(120)
    })

    it('生後1ヶ月は 150分 を返す', () => {
      expect(resolveThreshold(1, null, 'feeding')).toBe(150)
    })

    it('生後2ヶ月は 150分 を返す', () => {
      expect(resolveThreshold(2, null, 'feeding')).toBe(150)
    })

    it('生後3ヶ月は 180分 を返す', () => {
      expect(resolveThreshold(3, null, 'feeding')).toBe(180)
    })

    it('生後5ヶ月は 180分 を返す', () => {
      expect(resolveThreshold(5, null, 'feeding')).toBe(180)
    })

    it('生後6ヶ月は 240分 を返す', () => {
      expect(resolveThreshold(6, null, 'feeding')).toBe(240)
    })

    it('生後12ヶ月は 240分 を返す（6ヶ月以上は全て同じ）', () => {
      expect(resolveThreshold(12, null, 'feeding')).toBe(240)
    })
  })

  describe('diaper — WHOガイドライン閾値（カスタムなし）', () => {
    it('生後0ヶ月は 180分 を返す', () => {
      expect(resolveThreshold(0, null, 'diaper')).toBe(180)
    })

    it('生後1ヶ月は 240分 を返す', () => {
      expect(resolveThreshold(1, null, 'diaper')).toBe(240)
    })

    it('生後5ヶ月は 240分 を返す', () => {
      expect(resolveThreshold(5, null, 'diaper')).toBe(240)
    })

    it('生後6ヶ月は 360分 を返す', () => {
      expect(resolveThreshold(6, null, 'diaper')).toBe(360)
    })

    it('生後12ヶ月は 360分 を返す（6ヶ月以上は全て同じ）', () => {
      expect(resolveThreshold(12, null, 'diaper')).toBe(360)
    })
  })

  describe('カスタム閾値優先', () => {
    it('feeding: customMinutes が数値なら customMinutes を返す', () => {
      expect(resolveThreshold(0, 200, 'feeding')).toBe(200)
    })

    it('feeding: 月齢6ヶ月でも customMinutes=90 なら 90 を返す', () => {
      expect(resolveThreshold(6, 90, 'feeding')).toBe(90)
    })

    it('diaper: customMinutes が数値なら customMinutes を返す', () => {
      expect(resolveThreshold(2, 300, 'diaper')).toBe(300)
    })

    it('customMinutes=undefined のときはガイドライン値を返す', () => {
      expect(resolveThreshold(0, undefined, 'feeding')).toBe(120)
    })
  })
})
