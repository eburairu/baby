import { useState, useEffect, useRef, useCallback } from "react"
import { useUser } from "@/hooks/useAuth"
import { RecordCommentDialog } from "@/components/records/RecordCommentDialog"

interface UseRecordCommentsProps<T> {
    records: T[] | undefined
    recordType: string
    initialCommentRecordId?: number | null
    getTitle: (record: T) => string
    onCommentChange?: () => void
}

export function useRecordComments<T extends { id: number }>({
    records,
    recordType,
    initialCommentRecordId,
    getTitle,
    onCommentChange,
}: UseRecordCommentsProps<T>) {
    const { user } = useUser()
    const [target, setTarget] = useState<{ id: number; title: string } | null>(null)
    const initializedRef = useRef(false)

    // 初期ロード時に指定されたIDがあれば自動でダイアログを開く
    useEffect(() => {
        let timerId: ReturnType<typeof setTimeout> | undefined;

        if (
            initialCommentRecordId &&
            records &&
            records.length > 0 &&
            !initializedRef.current
        ) {
            const found = records.find((r) => r.id === initialCommentRecordId)
            if (found) {
                initializedRef.current = true
                // レンダリング直後のステート更新を避けるために非同期化
                timerId = setTimeout(() => {
                    setTarget({ id: found.id, title: getTitle(found) })
                }, 0)
            }
        }

        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        }
    }, [initialCommentRecordId, records, getTitle])

    const openComment = useCallback((record: T) => {
        setTarget({ id: record.id, title: getTitle(record) })
    }, [getTitle])

    const CommentDialog = useCallback(() => {
        if (!target) return null

        return (
            <RecordCommentDialog
                open={true}
                onOpenChange={(open) => {
                    if (!open) setTarget(null)
                }}
                recordType={recordType}
                recordId={target.id}
                title={target.title}
                currentUserId={user?.id}
                onCommentChange={onCommentChange}
            />
        )
    }, [target, recordType, user?.id, onCommentChange])

    return {
        openComment,
        CommentDialog,
        isCommentOpen: target !== null,
    }
}
