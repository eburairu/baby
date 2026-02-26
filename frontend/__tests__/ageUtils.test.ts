import { describe, it, expect, afterEach, vi } from "vitest"
import { calcAge, formatElapsed, formatDuration } from "@/lib/ageUtils"

describe("ageUtils", () => {
    afterEach(() => {
        vi.useRealTimers() // テストごとに時刻をリセット
    })

    describe("calcAge", () => {
        it("今日生まれた場合は生後0日を返す", () => {
            vi.setSystemTime(new Date("2024-05-20T10:00:00Z"))
            const result = calcAge("2024-05-20T00:00:00Z")
            expect(result.months).toBe(0)
            expect(result.days).toBe(0)
            expect(result.label).toBe("生後 0日")
        })

        it("翌日の場合は生後1日を返す", () => {
            vi.setSystemTime(new Date("2024-05-21T10:00:00Z"))
            const result = calcAge("2024-05-20T00:00:00Z")
            expect(result.days).toBe(1)
            expect(result.label).toBe("生後 1日")
        })

        it("ちょうど1ヶ月後の場合は生後1ヶ月を返す", () => {
            vi.setSystemTime(new Date("2024-06-20T10:00:00Z"))
            const result = calcAge("2024-05-20T00:00:00Z")
            expect(result.months).toBe(1)
            expect(result.days).toBe(0)
            expect(result.label).toBe("生後 1ヶ月")
        })

        it("1ヶ月と1日後の場合は生後1ヶ月1日を返す", () => {
            vi.setSystemTime(new Date("2024-06-21T10:00:00Z"))
            const result = calcAge("2024-05-20T00:00:00Z")
            expect(result.months).toBe(1)
            expect(result.days).toBe(1)
            expect(result.label).toBe("生後 1ヶ月1日")
        })

        it("月末生まれの境界値を正しく計算する (1月31日生まれの3月1日時点)", () => {
            vi.setSystemTime(new Date("2024-03-01T10:00:00Z"))
            const result = calcAge("2024-01-31T00:00:00Z")
            expect(result.months).toBe(1)
            expect(result.days).toBe(1)
            expect(result.label).toBe("生後 1ヶ月1日")
        })

        // Edge Cases
        it("ちょうど1年後の場合は生後 12ヶ月 を返す", () => {
            vi.setSystemTime(new Date("2025-05-20T10:00:00Z"))
            const result = calcAge("2024-05-20T00:00:00Z")
            expect(result.months).toBe(12)
            expect(result.days).toBe(0)
            expect(result.label).toBe("生後 12ヶ月")
        })

        it("月末生まれの境界値: 1月31日生まれの2月28日時点 (非うるう年)", () => {
            vi.setSystemTime(new Date("2023-02-28T10:00:00Z"))
            const result = calcAge("2023-01-31T00:00:00Z")
            expect(result.months).toBe(1)
            expect(result.days).toBe(0)
            expect(result.label).toBe("生後 1ヶ月")
        })

        it("月末生まれの境界値: 1月31日生まれの2月29日時点 (うるう年)", () => {
            vi.setSystemTime(new Date("2024-02-29T10:00:00Z"))
            const result = calcAge("2024-01-31T00:00:00Z")
            expect(result.months).toBe(1)
            expect(result.days).toBe(0)
            expect(result.label).toBe("生後 1ヶ月")
        })

        it("うるう年生まれ: 2月29日生まれの翌年2月28日時点", () => {
            vi.setSystemTime(new Date("2025-02-28T10:00:00Z"))
            const result = calcAge("2024-02-29T00:00:00Z")
            expect(result.months).toBe(12)
            expect(result.days).toBe(0)
            expect(result.label).toBe("生後 12ヶ月")
        })

        it("未来の誕生日を指定した場合は 0ヶ月0日 を返す", () => {
            vi.setSystemTime(new Date("2024-05-20T10:00:00Z"))
            const result = calcAge("2024-05-21T00:00:00Z")
            expect(result.months).toBe(0)
            expect(result.days).toBe(0)
            expect(result.label).toBe("生後 0日")
        })
    })

    describe("formatElapsed", () => {
        it("1分未満は 'たった今' を返す", () => {
            vi.setSystemTime(new Date("2024-05-20T10:00:00Z"))
            const date = new Date("2024-05-20T09:59:30Z").toISOString()
            expect(formatElapsed(date)).toBe("たった今")
        })

        it("1分以上60分未満は 'X分前' を返す", () => {
            vi.setSystemTime(new Date("2024-05-20T10:00:00Z"))
            const date = new Date("2024-05-20T09:50:00Z").toISOString()
            expect(formatElapsed(date)).toBe("10分前")
        })

        it("1時間以上24時間未満で端数がない場合は 'X時間前' を返す", () => {
            vi.setSystemTime(new Date("2024-05-20T10:00:00Z"))
            const date = new Date("2024-05-20T08:00:00Z").toISOString()
            expect(formatElapsed(date)).toBe("2時間前")
        })

        it("1時間以上24時間未満で端数がある場合は 'X時間Y分前' を返す", () => {
            vi.setSystemTime(new Date("2024-05-20T10:00:00Z"))
            const date = new Date("2024-05-20T08:30:00Z").toISOString()
            expect(formatElapsed(date)).toBe("1時間30分前")
        })

        it("24時間以上は 'X日前' を返す", () => {
            vi.setSystemTime(new Date("2024-05-21T11:00:00Z"))
            const date = new Date("2024-05-20T10:00:00Z").toISOString()
            expect(formatElapsed(date)).toBe("1日前")
        })

        // Edge Cases
        it("ちょうど60分前は '1時間前' を返す", () => {
            vi.setSystemTime(new Date("2024-05-20T10:00:00Z"))
            const date = new Date("2024-05-20T09:00:00Z").toISOString()
            expect(formatElapsed(date)).toBe("1時間前")
        })

        it("ちょうど24時間前は '1日前' を返す", () => {
            vi.setSystemTime(new Date("2024-05-21T10:00:00Z"))
            const date = new Date("2024-05-20T10:00:00Z").toISOString()
            expect(formatElapsed(date)).toBe("1日前")
        })

        it("未来の時刻は 'たった今' を返す", () => {
            vi.setSystemTime(new Date("2024-05-20T10:00:00Z"))
            const date = new Date("2024-05-20T10:05:00Z").toISOString()
            expect(formatElapsed(date)).toBe("たった今")
        })
    })

    describe("formatDuration", () => {
        it("60分未満は 'X分' を返す", () => {
            const start = "2024-05-20T10:00:00Z"
            const end = "2024-05-20T10:45:00Z"
            expect(formatDuration(start, end)).toBe("45分")
        })

        it("1時間ジャストは '1時間' を返す", () => {
            const start = "2024-05-20T10:00:00Z"
            const end = "2024-05-20T11:00:00Z"
            expect(formatDuration(start, end)).toBe("1時間")
        })

        it("1時間以上で端数がある場合は 'X時間Y分' を返す", () => {
            const start = "2024-05-20T10:00:00Z"
            const end = "2024-05-20T11:15:00Z"
            expect(formatDuration(start, end)).toBe("1時間15分")
        })

        it("endIso が指定されない場合は現在時刻を使用する", () => {
            vi.setSystemTime(new Date("2024-05-20T11:30:00Z"))
            const start = "2024-05-20T10:00:00Z"
            expect(formatDuration(start, null)).toBe("1時間30分")
        })

        // Edge Case
        it("マイナスの期間は '0分' を返す", () => {
            const start = "2024-05-20T11:00:00Z"
            const end = "2024-05-20T10:00:00Z"
            expect(formatDuration(start, end)).toBe("0分")
        })
    })

})
