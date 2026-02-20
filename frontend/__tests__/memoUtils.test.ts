import { describe, it, expect } from "vitest"
import { areRecordsEqual } from "@/lib/memoUtils"
import { BabyRecord } from "@/hooks/useData"

describe("areRecordsEqual", () => {
    const baseRecord: BabyRecord = {
        id: 1,
        type: 'feeding',
        timestamp: new Date().toISOString(),
        details: { amount_ml: 100 },
        comment_count: 0
    }

    it("returns true for identical references", () => {
        const records = [baseRecord]
        expect(areRecordsEqual(records, records, 'feeding')).toBe(true)
    })

    it("returns true for deep equal records", () => {
        const records1 = [{ ...baseRecord }]
        const records2 = [{ ...baseRecord }]
        expect(areRecordsEqual(records1, records2, 'feeding')).toBe(true)
    })

    it("returns false when length differs", () => {
        const records1 = [baseRecord]
        const records2 = [baseRecord, { ...baseRecord, id: 2 }]
        expect(areRecordsEqual(records1, records2, 'feeding')).toBe(false)
    })

    it("returns false when id differs", () => {
        const records1 = [baseRecord]
        const records2 = [{ ...baseRecord, id: 2 }]
        expect(areRecordsEqual(records1, records2, 'feeding')).toBe(false)
    })

    it("returns false when timestamp differs", () => {
        const records1 = [baseRecord]
        const records2 = [{ ...baseRecord, timestamp: new Date(Date.now() - 1000).toISOString() }]
        expect(areRecordsEqual(records1, records2, 'feeding')).toBe(false)
    })

    it("returns false when details differ for the latest record", () => {
        const records1 = [baseRecord]
        const records2 = [{ ...baseRecord, details: { amount_ml: 120 } }]
        expect(areRecordsEqual(records1, records2, 'feeding')).toBe(false)
    })

    it("returns false when details differ for a historical record", () => {
        const oldRecord = { ...baseRecord, id: 99, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() }
        const records1 = [baseRecord, oldRecord]
        const records2 = [baseRecord, { ...oldRecord, details: { amount_ml: 150 } }]
        expect(areRecordsEqual(records1, records2, 'feeding')).toBe(false)
    })

    it("ignores different types", () => {
        const records1 = [baseRecord, { ...baseRecord, id: 2, type: 'diaper' } as any]
        const records2 = [baseRecord]
        // Filtering by 'feeding' should result in identical lists
        expect(areRecordsEqual(records1, records2, 'feeding')).toBe(true)
    })

    it("handles undefined inputs", () => {
        expect(areRecordsEqual(undefined, undefined, 'feeding')).toBe(true)
        expect(areRecordsEqual([], undefined, 'feeding')).toBe(true)
        expect(areRecordsEqual(undefined, [], 'feeding')).toBe(true)
    })
})
