import { describe, it, expect } from "vitest"
import { DiaperQuickAddModal } from "@/components/diaper/DiaperQuickAddModal"

describe("DiaperQuickAddModal", () => {
    it("コンポーネントとして export されている", () => {
        expect(typeof DiaperQuickAddModal).toBe("function")
    })
})
