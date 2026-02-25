import * as z from "zod"

export const feedingSchema = z.object({
    feeding_time: z.string(),
    feeding_type: z.enum(["BREAST", "BOTTLE", "MIXED"]),
    left_breast_minutes: z.coerce.number().min(0).optional(),
    right_breast_minutes: z.coerce.number().min(0).optional(),
    amount_ml: z.coerce.number().optional(),
    notes: z.string().optional(),
})

export type FeedingFormValues = z.infer<typeof feedingSchema>
