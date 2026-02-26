import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"

interface UseBaseRecordFormOptions<T> {
    endpoint: string
    babyId: string | number
    onSuccess?: (data?: unknown) => void
    successMessage?: string
    errorMessage?: string
}

export function useBaseRecordForm<T>({
    endpoint,
    babyId,
    onSuccess,
    successMessage = "記録しました",
    errorMessage = "保存に失敗しました",
}: UseBaseRecordFormOptions<T>) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const submitRecord = async (
        values: T,
        payloadFormatter?: (values: T, basePayload: Record<string, unknown>) => unknown
    ) => {
        setIsSubmitting(true)
        setError(null)
        try {
            const basePayload = {
                ...values,
                baby_id: Number(babyId),
            }

            const payload = payloadFormatter ? payloadFormatter(values, basePayload) : basePayload

            const data = await api.post(endpoint, payload)

            if (successMessage) {
                toast.success(successMessage)
            }
            if (onSuccess) {
                onSuccess(data)
            }
            return data
        } catch (e) {
            console.error(e)
            const msg = e instanceof Error ? e.message : errorMessage
            setError(msg)
            if (errorMessage) {
                toast.error(errorMessage)
            }
            throw e
        } finally {
            setIsSubmitting(false)
        }
    }

    return { submitRecord, isSubmitting, error }
}
