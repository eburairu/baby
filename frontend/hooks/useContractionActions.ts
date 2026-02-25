import { useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { ContractionRecord } from "@/types/contraction"

interface UseContractionActionsOptions {
    onDeleted?: () => void
    onUpdated?: () => void
}

export function useContractionActions({ onDeleted, onUpdated }: UseContractionActionsOptions = {}) {
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
    const [editTarget, setEditTarget] = useState<ContractionRecord | null>(null)
    const [commentTarget, setCommentTarget] = useState<{ id: number; title: string } | null>(null)

    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const openDeleteDialog = useCallback((id: number) => setDeleteTargetId(id), [])
    const closeDeleteDialog = useCallback(() => setDeleteTargetId(null), [])

    const openEditDialog = useCallback((record: ContractionRecord) => setEditTarget(record), [])
    const closeEditDialog = useCallback(() => setEditTarget(null), [])

    const openCommentDialog = useCallback((id: number, title: string) => setCommentTarget({ id, title }), [])
    const closeCommentDialog = useCallback(() => setCommentTarget(null), [])

    const executeDelete = useCallback(async () => {
        if (deleteTargetId === null) return
        setIsDeleting(true)
        try {
            await api.delete(`/contractions/${deleteTargetId}`)
            onDeleted?.()
        } catch (err) {
            console.error("Failed to delete contraction", err)
        } finally {
            setIsDeleting(false)
            setDeleteTargetId(null)
        }
    }, [deleteTargetId, onDeleted])

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
        deleteTargetId,
        editTarget,
        commentTarget,
        isDeleting,
        isUpdating,

        // Actions
        openDeleteDialog,
        closeDeleteDialog,
        executeDelete,
        openEditDialog,
        closeEditDialog,
        executeUpdate,
        openCommentDialog,
        closeCommentDialog
    }
}
