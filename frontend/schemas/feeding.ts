import * as z from "zod"

export const feedingSchema = z.object({
    feeding_time: z.string(),
    feeding_type: z.enum(["BREAST", "BOTTLE", "MIXED"]),
    left_breast_minutes: z.coerce.number()
        .min(0, "0分以上を指定してください")
        .max(120, "120分以下を指定してください")
        .optional(),
    right_breast_minutes: z.coerce.number()
        .min(0, "0分以上を指定してください")
        .max(120, "120分以下を指定してください")
        .optional(),
    amount_ml: z.coerce.number()
        .min(0, "0ml以上を指定してください")
        .max(500, "500ml以下を指定してください")
        .optional(),
    notes: z.string()
        .max(2000, "メモは2000文字以内で入力してください")
        .optional(),
    burped: z.boolean().optional().nullable(),
})

export type FeedingFormValues = z.infer<typeof feedingSchema>
