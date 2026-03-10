import { z } from "zod"

export const milestoneSchema = z.object({
  milestone_type: z.string().min(1, "達成項目を選択してください"),
  title: z.string().min(1, "マイルストーン名を入力してください"),
  achieved_date: z.string().min(1, "達成日を選択してください"),
  image_urls: z.array(z.string()).max(10, "写真は最大10枚までです"),
  notes: z.string().optional().nullable(),
})

export type MilestoneFormValues = z.infer<typeof milestoneSchema>
