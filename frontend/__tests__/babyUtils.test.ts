import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { isBorn, calcDaysUntilDue, getPrenatalLabel } from "@/lib/babyUtils"

describe("isBorn", () => {
    it("birthday が null の場合は false を返す", () => {
        expect(isBorn(null)).toBe(false)
    })

    it("birthday が undefined の場合は false を返す", () => {
        expect(isBorn(undefined)).toBe(false)
    })

    it("birthday が空文字の場合は false を返す", () => {
        expect(isBorn("")).toBe(false)
    })

    it("birthday が設定されている場合は true を返す", () => {
        expect(isBorn("2025-10-31")).toBe(true)
    })
})

describe("calcDaysUntilDue", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 1, 18)) // 2026-02-18
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("dueDate が null の場合は null を返す", () => {
        expect(calcDaysUntilDue(null)).toBeNull()
    })

    it("dueDate が undefined の場合は null を返す", () => {
        expect(calcDaysUntilDue(undefined)).toBeNull()
    })

    it("予定日が未来の場合は正の日数を返す", () => {
        const result = calcDaysUntilDue("2026-03-01")
        expect(result).toBe(11) // 2026-02-18 → 2026-03-01 = 11日
    })

    it("予定日が今日の場合は 0 を返す", () => {
        const result = calcDaysUntilDue("2026-02-18")
        expect(result).toBe(0)
    })

    it("予定日が過去の場合は負の日数を返す", () => {
        const result = calcDaysUntilDue("2026-02-15")
        expect(result).toBe(-3) // 3日前
    })
})

describe("getPrenatalLabel", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(2026, 1, 18)) // 2026-02-18
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("dueDate が null の場合は '出産前' を返す", () => {
        expect(getPrenatalLabel(null)).toBe("出産前")
    })

    it("予定日が未来の場合は残り日数を含むラベルを返す", () => {
        expect(getPrenatalLabel("2026-03-01")).toBe("出産予定日まであと 11 日")
    })

    it("予定日が今日の場合は '出産予定日です！' を返す", () => {
        expect(getPrenatalLabel("2026-02-18")).toBe("出産予定日です！")
    })

    it("予定日が過去の場合は超過日数を含むラベルを返す", () => {
        expect(getPrenatalLabel("2026-02-15")).toBe("予定日を 3 日過ぎています")
    })
})
