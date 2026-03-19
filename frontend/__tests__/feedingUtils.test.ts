import { describe, it, expect, vi, afterEach } from 'vitest'
import { calculateFeedingStats, buildFeedingHourlyComparison, NormalizedFeeding } from '../lib/feedingUtils'

describe('calculateFeedingStats', () => {
  it('should return lastMilkAmount and lastBottleContentType correctly', () => {
    const mockFeedings: NormalizedFeeding[] = [
      {
        id: 1,
        timestamp: '2023-01-01T10:00:00Z',
        type: 'BOTTLE',
        amount: 100,
        duration: 0,
        leftDuration: 0,
        rightDuration: 0,
        lastBreastSide: null,
        bottleContentType: 'FORMULA'
      },
      {
        id: 2,
        timestamp: '2023-01-01T08:00:00Z',
        type: 'BREAST',
        amount: 0,
        duration: 15,
        leftDuration: 8,
        rightDuration: 7,
        lastBreastSide: 'RIGHT',
        bottleContentType: null
      }
    ]

    const result = calculateFeedingStats(mockFeedings)
    
    expect(result.lastMilkAmount).toBe(100)
    expect(result.lastBottleContentType).toBe('FORMULA')
  })
})

describe('buildFeedingHourlyComparison', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  // JST 2026-03-19 10:00:00 を固定する（UTC: 2026-03-19T01:00:00Z）
  const NOW_UTC = '2026-03-19T01:00:00Z'

  it('今日の記録が正しくカウントされる', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(NOW_UTC))

    // 今日 JST 09:00（UTC 00:00）の授乳
    const todayFeeding: NormalizedFeeding = {
      id: 1,
      timestamp: '2026-03-19T00:00:00+00:00', // 09:00 JST
      type: 'BREAST',
      amount: 0,
      duration: 10,
      leftDuration: 5,
      rightDuration: 5,
      lastBreastSide: 'RIGHT',
      bottleContentType: null,
    }

    const result = buildFeedingHourlyComparison([todayFeeding])

    // 時刻 9（JST 09:xx）以降の累積カウントが 1 になる
    expect(result[9].todayCount).toBe(1)
    expect(result[10].todayCount).toBe(1) // 現在時刻（10時）も含む
    expect(result[23].todayCount).toBe(1)
    // 9時より前は 0
    expect(result[8].todayCount).toBe(0)
  })

  it('今日の記録を追加すると比較データが変化する', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(NOW_UTC))

    // 追加前: 記録なし
    const before = buildFeedingHourlyComparison([])
    expect(before[9].todayCount).toBe(0)

    // 追加後: 今日 JST 09:00 の記録を加える
    const newFeeding: NormalizedFeeding = {
      id: 2,
      timestamp: '2026-03-19T00:00:00+00:00', // 09:00 JST
      type: 'BOTTLE',
      amount: 120,
      duration: 0,
      leftDuration: 0,
      rightDuration: 0,
      lastBreastSide: null,
      bottleContentType: 'FORMULA',
    }

    const after = buildFeedingHourlyComparison([newFeeding])
    expect(after[9].todayCount).toBe(1)
    expect(after[9].todayMl).toBe(120)
  })

  it('昨日以前の記録は今日のカウントに含まれない', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(NOW_UTC))

    // 昨日 JST 09:00（UTC 2026-03-18T00:00:00Z）
    const yesterdayFeeding: NormalizedFeeding = {
      id: 3,
      timestamp: '2026-03-18T00:00:00+00:00', // 昨日 JST 09:00
      type: 'BREAST',
      amount: 0,
      duration: 15,
      leftDuration: 8,
      rightDuration: 7,
      lastBreastSide: 'LEFT',
      bottleContentType: null,
    }

    const result = buildFeedingHourlyComparison([yesterdayFeeding])

    // 今日のカウントは常に 0
    result.forEach(p => {
      expect(p.todayCount).toBe(0)
    })
    // 7日平均には含まれる（yesterday は直近7日のうちの1日）
    expect(result[9].avg7Count).toBeGreaterThan(0)
  })
})
