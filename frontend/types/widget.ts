import { BabyRecord } from "@/hooks/useData"

export interface BaseWidgetProps {
    babyId: string
    records?: BabyRecord[]
    isError?: unknown
    mutate?: () => void
    isLoading?: boolean
}
