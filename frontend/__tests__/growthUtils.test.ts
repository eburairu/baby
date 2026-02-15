import { describe, it, expect } from "vitest"
import { mergeData } from "../utils/growthUtils"

describe("growthUtils", () => {
    describe("mergeData", () => {
        const mockRecords = [
            {
                date: "2023-01-01",
                weight: 3000,
                height: 50,
                head_circumference: 34
            }
        ];

        it("should convert weight from grams to kilograms", () => {
            const merged = mergeData(mockRecords, [], 'weight');
            expect(merged[0].weight).toBe(3);
        });

        it("should use 'head' key for head circumference", () => {
            const merged = mergeData(mockRecords, [], 'head');
            expect(merged[0].head).toBe(34);
        });

        it("should use 'height' key for height", () => {
            const merged = mergeData(mockRecords, [], 'height');
            expect(merged[0].height).toBe(50);
        });

        it("should include WHO data with correct keys for head", () => {
            const whoData = [
                { date: new Date("2023-01-01").getTime(), p3: 31, p50: 34, p97: 37, month: 0 }
            ];
            const merged = mergeData([], whoData, 'head');
            expect(merged[0].who_head_p3).toBe(31);
            expect(merged[0].who_head_p50).toBe(34);
            expect(merged[0].who_head_p97).toBe(37);
        });

        it("should include WHO data with correct keys for weight", () => {
            const whoData = [
                { date: new Date("2023-01-01").getTime(), p3: 2.5, p50: 3.3, p97: 4.3, month: 0 }
            ];
            const merged = mergeData([], whoData, 'weight');
            expect(merged[0].who_weight_p3).toBe(2.5);
            expect(merged[0].who_weight_p50).toBe(3.3);
            expect(merged[0].who_weight_p97).toBe(4.3);
        });
    });
});
