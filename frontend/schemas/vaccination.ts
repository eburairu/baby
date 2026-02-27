import { z } from "zod"

export const vaccinationSchema = z.object({
  vaccine_name: z.string().min(1, "ワクチン名を入力してください"),
  dose_number: z.coerce.number().min(1, "回数は1以上を指定してください"),
  status: z.enum(["scheduled", "completed", "postponed"]),
  scheduled_date: z.string().min(1, "予定日を選択してください"),
  completed_date: z.string().optional().nullable(),
  lot_number: z.string().optional().nullable(),
  hospital_name: z.string().optional().nullable(),
  has_side_effect: z.boolean().default(false),
  notes: z.string().optional().nullable(),
})

export type VaccinationFormValues = z.infer<typeof vaccinationSchema>
