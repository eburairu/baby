import { useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { ContractionRecord } from "@/types/contraction"

interface UseContractionActionsOptions {
    onUpdated?: () => void
}

export function useContractionActions({ onUpdated }: UseContractionActionsOptions = {}) {
    const [editTarget, setEditTarget] = useState<ContractionRecord | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const openEditDialog = useCallback((record: ContractionRecord) => setEditTarget(record), [])
    const closeEditDialog = useCallback(() => setEditTarget(null), [])

    const executeUpdate = useCallback(async (formData: FormData) => {
        if (!editTarget) return

        setIsUpdating(true)
        try {
            const startTimeStr = formData.get("start_time") as string
            const durationStr = formData.get("duration_seconds") as string
            const notes = formData.get("notes") as string

            const originalStart = new Date(editTarget.start_time)
            const [hours, minutes] = startTimeStr.split(":").map(Number)
            const newStart = new Date(originalStart)
            newStart.setHours(hours, minutes, 0, 0)

            const durationSeconds = parseInt(durationStr, 10)
            const newEnd = new Date(newStart.getTime() + durationSeconds * 1000)

            await api.patch(`/contractions/${editTarget.id}`, {
                start_time: newStart.toISOString(),
                end_time: newEnd.toISOString(),
                duration_seconds: durationSeconds,
                notes: notes,
            })

            setEditTarget(null)
            onUpdated?.()
        } catch (err) {
            console.error("Failed to update contraction", err)
        } finally {
            setIsUpdating(false)
        }
    }, [editTarget, onUpdated])

    return {
        // State
        editTarget,
        isUpdating,

        // Actions
        openEditDialog,
        closeEditDialog,
        executeUpdate,
    }
}
