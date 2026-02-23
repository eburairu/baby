"use client"
import { useState } from "react"
import { toast } from "sonner"

interface UseAsyncActionOptions<T> {
    onSuccess?: (data: T) => void
    onError?: (error: unknown) => void
    successMessage?: string
    errorMessage?: string
}

export function useAsyncAction() {
    const [loading, setLoading] = useState(false)

    const execute = async <T>(
        action: () => Promise<T>,
        options: UseAsyncActionOptions<T> = {}
    ) => {
        if (loading) return
        setLoading(true)
        try {
            const result = await action()
            if (options.successMessage) {
                toast.success(options.successMessage)
            }
            if (options.onSuccess) {
                options.onSuccess(result)
            }
            return result
        } catch (error) {
            console.error(error)
            if (options.errorMessage) {
                toast.error(options.errorMessage)
            }
            if (options.onError) {
                options.onError(error)
            }
        } finally {
            setLoading(false)
        }
    }

    return { loading, execute }
}
