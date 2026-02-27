import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"

interface UseBaseRecordFormOptions<_T> {
    endpoint?: string
    babyId?: string | number
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

    const submitRecord = async <TPayload = unknown, TResult = unknown>(
        values: T,
        payloadFormatter?: (values: T, basePayload: Record<string, unknown>) => TPayload,
        customSubmitter?: (payload: TPayload) => Promise<TResult>
    ) => {
        setIsSubmitting(true)
        setError(null)
        try {
            const basePayload = babyId ? {
                ...values,
                baby_id: Number(babyId),
            } : { ...values } as unknown as Record<string, unknown>

            // Remove any accidental baby_id from values to prevent mismatch if babyId is provided
            if (babyId && typeof values === 'object' && values !== null && 'baby_id' in values) {
                delete (basePayload as Record<string, unknown>).baby_id;
                (basePayload as Record<string, unknown>).baby_id = Number(babyId);
            }

            const payload = payloadFormatter 
                ? payloadFormatter(values, basePayload) 
                : (basePayload as unknown as TPayload)

            let data: TResult;
            if (customSubmitter) {
                data = await customSubmitter(payload)
            } else {
                if (!endpoint) {
                    throw new Error("Endpoint is required if customSubmitter is not provided")
                }
                data = await api.post(endpoint, payload) as unknown as TResult
            }

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
