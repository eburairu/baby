import { describe, it, expect } from "vitest"
import { mergeData } from "@/lib/growthUtils"

describe("growthUtils", () => {
    describe("mergeData", () => {
        it("should use 'head' as key for head circumference data", () => {
            const records = [
                {
                    date: "2023-01-01",
                    weight: 3000,
                    height: 50,
                    head_circumference: 35
                }
            ]
            const result = mergeData(records, [], "head")

            expect(result).toHaveLength(1)
            expect(result[0]).toHaveProperty("head", 35)
            expect(result[0]).not.toHaveProperty("head_circumference")
            expect(result[0]).not.toHaveProperty("head_circumference_cm")
        })

        it("should handle missing head circumference data", () => {
            const records = [
                {
                    date: "2023-01-01",
                    weight: 3000,
                    height: 50,
                    head_circumference: null
                }
            ]
            const result = mergeData(records, [], "head")

            expect(result).toHaveLength(1)
            expect(result[0]).toHaveProperty("head", null)
        })
    })
})
