import { describe, it, expect, afterEach, vi } from "vitest"
import { isToday } from "@/lib/dateUtils"

describe("dateUtils", () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    describe("isToday", () => {
        it("今日の日付の場合は true を返す (文字列)", () => {
            vi.setSystemTime(new Date("2024-05-20T12:00:00Z"))
            const date = "2024-05-20T00:00:00Z"
            expect(isToday(date)).toBe(true)
        })

        it("今日の日付の場合は true を返す (Dateオブジェクト)", () => {
            vi.setSystemTime(new Date("2024-05-20T12:00:00Z"))
            const date = new Date("2024-05-20T00:00:00Z")
            expect(isToday(date)).toBe(true)
        })

        it("昨日の日付の場合は false を返す", () => {
            vi.setSystemTime(new Date("2024-05-20T12:00:00Z"))
            const date = "2024-05-19T10:00:00Z"
            expect(isToday(date)).toBe(false)
        })

        it("明日の日付の場合は false を返す", () => {
            vi.setSystemTime(new Date("2024-05-20T12:00:00Z"))
            const date = "2024-05-21T00:00:00Z"
            expect(isToday(date)).toBe(false)
        })

        it("前年の同日の場合は false を返す", () => {
            vi.setSystemTime(new Date("2024-05-20T12:00:00Z"))
            const date = "2023-05-20T12:00:00Z"
            expect(isToday(date)).toBe(false)
        })
    })
})
