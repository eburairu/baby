import { describe, it, expect } from 'vitest'
import { buildRhythmData, calcMedianIntervalMin } from '../lib/rhythmUtils'

// テスト用の固定日時: 2026-03-05 (今日) として各テストで使う
// タイムスタンプは JST (+09:00) で記述する
const TODAY = '2026-03-05'

function ts(date: string, time: string) {
  return `${date}T${time}:00+09:00`
}

describe('buildRhythmData', () => {
  it('今日の記録を dayOffset=0 として返す', () => {
    const items = [
      { timestamp: ts(TODAY, '09:00'), label: '授乳' },
    ]
    const result = buildRhythmData(items, TODAY)
    expect(result).toHaveLength(1)
    expect(result[0].dayOffset).toBe(0)
  })

  it('昨日の記録を dayOffset=1 として返す', () => {
    const items = [
      { timestamp: ts('2026-03-04', '10:00'), label: '授乳' },
    ]
    const result = buildRhythmData(items, TODAY)
    expect(result).toHaveLength(1)
    expect(result[0].dayOffset).toBe(1)
  })

  it('6日前の記録を dayOffset=6 として返す', () => {
    const items = [
      { timestamp: ts('2026-02-27', '10:00'), label: 'おむつ' },
    ]
    const result = buildRhythmData(items, TODAY)
    expect(result).toHaveLength(1)
    expect(result[0].dayOffset).toBe(6)
  })

  it('7日以上前の記録は除外する', () => {
    const items = [
      { timestamp: ts('2026-02-26', '10:00'), label: '古い記録' },
    ]
    const result = buildRhythmData(items, TODAY)
    expect(result).toHaveLength(0)
  })

  it('timeMinutes が JST で正しく計算される (09:30 JST → 570)', () => {
    const items = [
      { timestamp: '2026-03-05T09:30:00+09:00', label: 'テスト' },
    ]
    const result = buildRhythmData(items, TODAY)
    expect(result[0].timeMinutes).toBe(9 * 60 + 30) // 570
  })

  it('color が渡された場合は返す', () => {
    const items = [
      { timestamp: ts(TODAY, '09:00'), label: 'ミルク', color: '#f43f5e' },
    ]
    const result = buildRhythmData(items, TODAY)
    expect(result[0].color).toBe('#f43f5e')
  })

  it('color が渡されない場合は undefined', () => {
    const items = [
      { timestamp: ts(TODAY, '09:00'), label: '授乳' },
    ]
    const result = buildRhythmData(items, TODAY)
    expect(result[0].color).toBeUndefined()
  })

  it('複数記録を正しく変換する', () => {
    const items = [
      { timestamp: ts(TODAY, '06:00'), label: '朝' },
      { timestamp: ts('2026-03-04', '12:00'), label: '昨日昼' },
      { timestamp: ts('2026-02-25', '10:00'), label: '8日前（除外）' },
    ]
    const result = buildRhythmData(items, TODAY)
    expect(result).toHaveLength(2)
  })
})

describe('calcMedianIntervalMin', () => {
  it('2件の記録から間隔を計算する', () => {
    const timestamps = [
      '2026-03-05T06:00:00+09:00',
      '2026-03-05T09:00:00+09:00', // 3時間後
    ]
    const result = calcMedianIntervalMin(timestamps)
    expect(result).toBe(180)
  })

  it('3件の記録から中央値を返す', () => {
    // 間隔: 120分, 180分 → 中央値 150分
    const timestamps = [
      '2026-03-05T06:00:00+09:00',
      '2026-03-05T08:00:00+09:00', // +120min
      '2026-03-05T11:00:00+09:00', // +180min
    ]
    const result = calcMedianIntervalMin(timestamps)
    expect(result).toBe(150)
  })

  it('4件の記録から中央値（奇数個の間隔）を返す', () => {
    // intervals: [60, 120, 180] → sorted → mid=1 → 120
    const timestamps = [
      '2026-03-05T06:00:00+09:00',
      '2026-03-05T07:00:00+09:00', // +60
      '2026-03-05T09:00:00+09:00', // +120
      '2026-03-05T12:00:00+09:00', // +180
    ]
    const result = calcMedianIntervalMin(timestamps)
    expect(result).toBe(120)
  })

  it('1件以下の場合は null を返す', () => {
    expect(calcMedianIntervalMin([])).toBeNull()
    expect(calcMedianIntervalMin(['2026-03-05T06:00:00+09:00'])).toBeNull()
  })

  it('順不同のタイムスタンプでも正しく計算する', () => {
    const timestamps = [
      '2026-03-05T09:00:00+09:00',
      '2026-03-05T06:00:00+09:00', // 順番が逆
    ]
    const result = calcMedianIntervalMin(timestamps)
    expect(result).toBe(180)
  })
})
