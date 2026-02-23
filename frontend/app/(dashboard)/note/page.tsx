"use client"

import { StickyNote } from "lucide-react"

import { useNotes } from "@/hooks/useNotes"
import { useRecordPage } from "@/hooks/useRecordPage"
import { NoteForm } from "@/components/note/NoteForm"
import { NoteHistory } from "@/components/note/NoteHistory"
import { TipsCard } from "@/components/ui/tips-card"
import { noteTips } from "@/lib/tips-data"
import { RecordPageLayout } from "@/components/ui/record-page-layout"

/**
 * メモ（日記）ページ
 */
export default function NotePage() {
    const {
        babyId,
        isLoading: babiesLoading,
        canWrite,
        triggerFeedback,
        commentRecordId,
    } = useRecordPage()

    const numericBabyId = babyId ? parseInt(babyId, 10) : undefined

    const {
        notes,
        isLoading: notesLoading,
        isError: notesError,
        mutate: mutateNotes
    } = useNotes(babyId ?? null)

    const handleRefresh = async () => {
        await mutateNotes()
    }

    return (
        <RecordPageLayout
            title="メモ一覧"
            icon={StickyNote}
            iconColorClass="text-amber-500 dark:text-amber-400"
            isLoading={babiesLoading}
            isDataLoading={notesLoading}
            apiError={notesError}
            babyId={babyId}
            onRefresh={handleRefresh}
        >
            <TipsCard {...noteTips} />

            {canWrite && numericBabyId && (
                <NoteForm
                    babyId={numericBabyId}
                    onAddSuccess={(recordId) => {
                        mutateNotes()
                        if (recordId) triggerFeedback("note", recordId)
                    }}
                />
            )}

            <NoteHistory
                notes={notes || []}
                onRefresh={() => mutateNotes()}
                canWrite={canWrite}
                initialCommentRecordId={commentRecordId ?? null}
            />
        </RecordPageLayout>
    )
}
