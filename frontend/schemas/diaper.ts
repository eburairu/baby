import * as z from "zod"
import { DiaperType } from "@/types/diaper"

export const diaperSchema = z.object({
    diaper_type: z.nativeEnum(DiaperType),
    change_time: z.string(),
    notes: z.string().optional(),
    poop_color: z.string().optional(),
    custom_poop_color: z.string().optional(),
    poop_consistency: z.string().optional(),
    custom_poop_consistency: z.string().optional(),
    poop_amount: z.string().optional(),
    custom_poop_amount: z.string().optional(),
})

export type DiaperFormValues = z.infer<typeof diaperSchema>
