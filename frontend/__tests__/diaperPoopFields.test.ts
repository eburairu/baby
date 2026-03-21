import { describe, it, expect } from "vitest"
import { POOP_COLORS, POOP_AMOUNTS, POOP_CONSISTENCIES } from "@/constants/diaper"
import { resolvePoopField } from "@/lib/diaperPoopUtils"

describe("POOP_CONSISTENCIES定数", () => {
    it("状態の選択肢が定義されている", () => {
        expect(POOP_CONSISTENCIES.length).toBeGreaterThan(0)
        expect(POOP_CONSISTENCIES).toContain("普通")
        expect(POOP_CONSISTENCIES).toContain("やわらかい")
        expect(POOP_CONSISTENCIES).toContain("その他")
    })
})

describe("resolvePoopField", () => {
    it("通常の値をそのまま返す", () => {
        expect(resolvePoopField("黄色", "")).toBe("黄色")
    })

    it("「その他」の場合はcustomValueを返す", () => {
        expect(resolvePoopField("その他", "カスタム色")).toBe("カスタム色")
    })

    it("「その他」でcustomValueが空の場合はnullを返す", () => {
        expect(resolvePoopField("その他", "")).toBeNull()
        expect(resolvePoopField("その他", undefined)).toBeNull()
    })

    it("空文字はnullを返す", () => {
        expect(resolvePoopField("", "")).toBeNull()
        expect(resolvePoopField(undefined, "")).toBeNull()
    })
})
