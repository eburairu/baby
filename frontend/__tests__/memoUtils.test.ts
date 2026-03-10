import { describe, it, expect, vi } from "vitest"
import { areRecordsEqual, createWidgetMemoComparison } from "@/lib/memoUtils"
import { BabyRecord } from "@/types/record"
import { BaseWidgetProps } from "@/types/widget"

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
        const records1 = [baseRecord, { ...baseRecord, id: 2, type: 'diaper' } as unknown as BabyRecord]
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

describe("createWidgetMemoComparison", () => {
    const compare = createWidgetMemoComparison('feeding')
    const baseProps: BaseWidgetProps = {
        babyId: "1",
        records: [],
        isLoading: false,
        isError: null,
        mutate: vi.fn()
    }

    it("returns true when props are equal", () => {
        expect(compare(baseProps, baseProps)).toBe(true)
    })

    it("returns false when isLoading changes", () => {
        expect(compare(baseProps, { ...baseProps, isLoading: true })).toBe(false)
    })

    it("returns false when isError changes", () => {
        expect(compare(baseProps, { ...baseProps, isError: "Error" })).toBe(false)
    })

    it("returns false when babyId changes", () => {
        expect(compare(baseProps, { ...baseProps, babyId: "2" })).toBe(false)
    })

    it("returns false when mutate changes", () => {
        expect(compare(baseProps, { ...baseProps, mutate: vi.fn() })).toBe(false)
    })

    it("delegates to areRecordsEqual for records", () => {
        // Since we already tested areRecordsEqual, we just check simple cases here
        const propsWithRecords = { ...baseProps, records: [{ id: 1, type: 'feeding', timestamp: '2023-01-01', details: {}, comment_count: 0 }] as BabyRecord[] }
        const propsWithDifferentRecords = { ...baseProps, records: [{ id: 2, type: 'feeding', timestamp: '2023-01-01', details: {}, comment_count: 0 }] as BabyRecord[] }

        expect(compare(propsWithRecords, propsWithRecords)).toBe(true)
        expect(compare(propsWithRecords, propsWithDifferentRecords)).toBe(false)
    })
})
