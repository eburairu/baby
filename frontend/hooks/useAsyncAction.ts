"use client"
import { useState } from "react"
import { toast } from "sonner"
import * as Sentry from "@sentry/nextjs"

interface UseAsyncActionOptions<T> {
    onSuccess?: (data: T) => void
    onError?: (error: unknown) => void
    successMessage?: string
    errorMessage?: string
}

export function useAsyncAction() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown | null>(null)

    const execute = async <T>(
        action: () => Promise<T>,
        options: UseAsyncActionOptions<T> = {}
    ) => {
        setError(null)
        if (loading) return
        setLoading(true)
        Sentry.logger.trace("Entering async action", { hasSuccessMsg: !!options.successMessage })
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
            setError(error)
            Sentry.logger.error("Async action failed", { error })
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

    return { loading, error, execute }
}
