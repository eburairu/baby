import { BabyRecord } from "@/types/record"

export interface BaseWidgetProps {
    babyId: string
    records?: BabyRecord[]
    isError?: unknown
    mutate?: () => void
    isLoading?: boolean
    size?: number
}
