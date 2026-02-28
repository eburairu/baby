import { describe, it, expect } from 'vitest'
import { calculateFeedingStats, NormalizedFeeding } from '../lib/feedingUtils'

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
