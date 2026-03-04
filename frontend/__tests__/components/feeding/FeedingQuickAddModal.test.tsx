import { describe, it, expect } from "vitest"
// TDD: FeedingQuickAddModal が実装されるまで Red
import { FeedingQuickAddModal } from "@/components/feeding/FeedingQuickAddModal"

describe("FeedingQuickAddModal", () => {
    it("コンポーネントとして export されている", () => {
        expect(typeof FeedingQuickAddModal).toBe("function")
    })
})
