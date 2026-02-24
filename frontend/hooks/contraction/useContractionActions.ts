import { useState, useCallback, useRef, useEffect } from "react"
import { api } from "@/lib/api"
import type { ContractionRecord } from "@/types/contraction"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface UseContractionActionsProps {
    contractions: ContractionRecord[]
    onDeleted: () => void
    onUpdated?: () => void
    initialCommentRecordId?: number | null
}

export function useContractionActions({ contractions, onDeleted, onUpdated, initialCommentRecordId }: UseContractionActionsProps) {
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
    const [editTarget, setEditTarget] = useState<ContractionRecord | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [commentTarget, setCommentTarget] = useState<{ id: number; title: string } | null>(null)
    const initializedRef = useRef(false)

    useEffect(() => {
        if (initialCommentRecordId && contractions.length > 0 && !initializedRef.current) {
            const target = contractions.find(c => c.id === initialCommentRecordId)
            if (target) {
                initializedRef.current = true
                setCommentTarget({ id: target.id, title: `陣痛 ${format(new Date(target.start_time), "yyyy/MM/dd HH:mm", { locale: ja })}` })
            }
        }
    }, [initialCommentRecordId, contractions])

    const handleDelete = useCallback(async () => {
        if (deleteTargetId === null) return
        setIsDeleting(true)
        try {
            await api.delete(`/contractions/${deleteTargetId}`)
            onDeleted()
        } catch (err) {
            console.error("Failed to delete contraction", err)
        } finally {
            setIsDeleting(false)
            setDeleteTargetId(null)
        }
    }, [deleteTargetId, onDeleted])

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editTarget) return

        setIsUpdating(true)
        try {
            const formData = new FormData(e.currentTarget)
            const startTimeStr = formData.get("start_time") as string
            const durationStr = formData.get("duration_seconds") as string
            const notes = formData.get("notes") as string

            // 日付部分は維持しつつ時刻だけ更新
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
    }

    const openComment = (record: ContractionRecord) => {
        setCommentTarget({ id: record.id, title: `陣痛 ${format(new Date(record.start_time), "yyyy/MM/dd HH:mm", { locale: ja })}` })
    }

    return {
        deleteTargetId,
        setDeleteTargetId,
        editTarget,
        setEditTarget,
        isDeleting,
        isUpdating,
        commentTarget,
        setCommentTarget,
        handleDelete,
        handleUpdate,
        openComment
    }
}
