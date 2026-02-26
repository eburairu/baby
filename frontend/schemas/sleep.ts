import * as z from "zod"

export const sleepSchema = z.object({
    start_time: z.string().min(1, "開始日時は必須です"),
    end_time: z.string().optional(),
    notes: z.string().optional(),
})

export type SleepFormValues = z.infer<typeof sleepSchema>
