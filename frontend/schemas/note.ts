import * as z from "zod"

export const noteSchema = z.object({
    note_time: z.string().min(1, "日時は必須です"),
    content: z.string().min(1, "内容は必須です").max(2000, "2000文字以内で入力してください"),
})

export type NoteFormValues = z.infer<typeof noteSchema>
