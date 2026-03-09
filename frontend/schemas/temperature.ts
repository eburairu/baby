import * as z from "zod"
import { TemperatureMethod } from "@/types/temperature"

const TEMPERATURE_MIN = 34.0
const TEMPERATURE_MAX = 42.0

export const temperatureSchema = z.object({
    measured_at: z.string().min(1, "日時を選択してください"),
    temperature: z
        .string()
        .min(1, "体温を入力してください")
        .refine(
            (val) => {
                const num = parseFloat(val)
                return !isNaN(num) && num >= TEMPERATURE_MIN && num <= TEMPERATURE_MAX
            },
            { message: `体温は${TEMPERATURE_MIN}〜${TEMPERATURE_MAX}°Cの範囲で入力してください` }
        ),
    method: z.nativeEnum(TemperatureMethod),
    notes: z.string().optional(),
})

export type TemperatureFormValues = z.infer<typeof temperatureSchema>
