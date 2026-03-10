import * as z from "zod"

export const growthSchema = z.object({
    date: z.string().min(1, "日付を選択してください"),
    height: z.string().optional(),
    weight: z.string().optional(),
    head_circumference: z.string().optional(),
    notes: z.string().optional(),
}).refine(data => data.height || data.weight || data.head_circumference, {
    message: "身長、体重、頭囲の少なくとも1つを入力してください",
    path: ["height"],
})

export type GrowthFormValues = z.infer<typeof growthSchema>
