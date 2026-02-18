import { describe, it, expect } from "vitest";
import { generateWhoSeries, mergeData } from "../utils/growthUtils";

describe("growthUtils", () => {
    describe("generateWhoSeries", () => {
        const birthday = "2024-01-01T00:00:00Z";

        it("should return an empty array if birthday is null", () => {
            expect(generateWhoSeries(null, "male", "height")).toEqual([]);
        });

        it("should return an empty array if gender is null or undefined", () => {
            expect(generateWhoSeries(birthday, null, "height")).toEqual([]);
            expect(generateWhoSeries(birthday, undefined, "height")).toEqual([]);
        });

        it("should return an empty array for 'other' gender", () => {
            expect(generateWhoSeries(birthday, "other", "height")).toEqual([]);
        });

        it("should handle 'male' gender correctly", () => {
            const result = generateWhoSeries(birthday, "male", "height");
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].month).toBe(0);
            // check first data point for male height (from who_standards_data.ts)
            // 0: { p3: 46.3, p50: 49.9, p97: 53.4 }
            expect(result[0].p3).toBe(46.3);
            expect(result[0].p50).toBe(49.9);
            expect(result[0].p97).toBe(53.4);
        });

        it("should handle 'boy' as 'male'", () => {
            const result = generateWhoSeries(birthday, "Boy", "weight");
            expect(result.length).toBeGreaterThan(0);
            // check first data point for male weight
            // 0: { p3: 2.5, p50: 3.3, p97: 4.3 }
            expect(result[0].p3).toBe(2.5);
        });

        it("should handle 'female' gender correctly", () => {
            const result = generateWhoSeries(birthday, "female", "height");
            expect(result.length).toBeGreaterThan(0);
            // 0: { p3: 45.6, p50: 49.1, p97: 52.7 }
            expect(result[0].p3).toBe(45.6);
        });

        it("should handle 'girl' as 'female'", () => {
            const result = generateWhoSeries(birthday, "GIRL", "head");
            expect(result.length).toBeGreaterThan(0);
            // 0: { p3: 31.5, p50: 33.9, p97: 36.2 }
            expect(result[0].p3).toBe(31.5);
        });

        it("should calculate dates correctly for each month", () => {
            const result = generateWhoSeries(birthday, "male", "height");
            const birthDate = new Date(birthday);

            // Month 0
            expect(new Date(result[0].date).toISOString()).toBe(birthDate.toISOString());

            // Month 1
            const expectedMonth1 = new Date(birthDate);
            expectedMonth1.setMonth(birthDate.getMonth() + 1);
            expect(new Date(result[1].date).toISOString()).toBe(expectedMonth1.toISOString());

            // Month 12
            const expectedMonth12 = new Date(birthDate);
            expectedMonth12.setMonth(birthDate.getMonth() + 12);
            // Find the index for month 12
            const month12Index = result.findIndex(p => p.month === 12);
            expect(new Date(result[month12Index].date).toISOString()).toBe(expectedMonth12.toISOString());
        });

        it("should return the correct number of points for each type", () => {
            // Male Height: 21 points
            expect(generateWhoSeries(birthday, "male", "height").length).toBe(21);
            // Male Weight: 21 points
            expect(generateWhoSeries(birthday, "male", "weight").length).toBe(21);
            // Male Head: 8 points
            expect(generateWhoSeries(birthday, "male", "head").length).toBe(8);
        });
    });

    describe("mergeData", () => {
        const whoData = [
            { date: new Date("2024-01-01").getTime(), p3: 45, p50: 49, p97: 53, month: 0 },
            { date: new Date("2024-02-01").getTime(), p3: 50, p50: 54, p97: 58, month: 1 },
        ];

        it("should merge user records and WHO data", () => {
            const records = [
                { date: "2024-01-15", height: 50 },
            ];
            const result = mergeData(records, whoData, "height");

            expect(result.length).toBe(3); // 2 WHO points + 1 record
            // Should be sorted by date
            expect(result[0].date).toBe(whoData[0].date);
            expect(result[1].date).toBe(new Date("2024-01-15").getTime());
            expect(result[2].date).toBe(whoData[1].date);
        });

        it("should handle weight conversion from grams to kilograms", () => {
            const records = [
                { date: "2024-01-15", weight: 3500 }, // 3.5kg
            ];
            const result = mergeData(records, [], "weight");
            expect(result[0].weight).toBe(3.5);
        });

        it("should handle null values in records", () => {
            const records = [
                { date: "2024-01-15", height: null },
            ];
            const result = mergeData(records, [], "height");
            expect(result[0].height).toBeNull();
        });

        it("should use correct WHO field names based on type", () => {
            const resultHeight = mergeData([], whoData, "height");
            expect(resultHeight[0].who_height_p3).toBe(45);
            expect(resultHeight[0].who_height_p50).toBe(49);
            expect(resultHeight[0].who_height_p97).toBe(53);

            const resultWeight = mergeData([], whoData, "weight");
            expect(resultWeight[0].who_weight_p3).toBe(45);

            const resultHead = mergeData([], whoData, "head");
            expect(resultHead[0].who_head_p3).toBe(45);
        });

        it("should handle head circumference correctly", () => {
            const records = [
                { date: "2024-01-15", head_circumference: 35 },
            ];
            const result = mergeData(records, [], "head");
            expect(result[0].head).toBe(35);
        });
    });
});
