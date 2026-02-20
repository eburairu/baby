"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { StickyNote } from "lucide-react"

import { useBabies } from "@/hooks/useData"
import { useNotes } from "@/hooks/useNotes"
import { usePermissions } from "@/hooks/usePermissions"
import { useBabyStore } from "@/stores/babyStore"
import { NoteForm } from "@/components/note/NoteForm"
import { NoteHistory } from "@/components/note/NoteHistory"
import { PageLoading } from "@/components/ui/page-loading"
import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"
import { AccessDenied } from "@/components/ui/access-denied"
import { TipsCard } from "@/components/ui/tips-card"
import { noteTips } from "@/lib/tips-data"
import { isApiError } from "@/lib/api"
import { useRecordFeedback } from "@/hooks/useRecordFeedback"

export default function NotePage() {
    const searchParams = useSearchParams()
    const commentRecordId = searchParams.get("comment")
    const commentBabyId = searchParams.get("baby_id")
    const { babies, isLoading: babiesLoading } = useBabies()
    const { selectedBabyId } = useBabyStore()
    const { canWrite } = usePermissions()

    // baby_id from URL takes priority (e.g. from notification link)
    const effectiveBabyIdStr = commentBabyId ?? selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)
    const babyId = effectiveBabyIdStr ? parseInt(effectiveBabyIdStr, 10) : null

    const {
        notes,
        isLoading: notesLoading,
        isError: notesError,
        mutate: mutateNotes
    } = useNotes(babyId)
    const { triggerFeedback } = useRecordFeedback(babyId)

    if (babiesLoading) {
        return <PageLoading />
    }

    if (!babyId) {
        return (
            <div className="p-4 text-center">
                <p>赤ちゃんが登録されていません。</p>
            </div>
        )
    }

    const isAccessDenied = isApiError(notesError) && notesError.status === 403

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 transition-colors">
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-center h-14 px-4 max-w-2xl mx-auto">
                    <h1 className="text-base font-semibold text-gray-800 dark:text-zinc-100 flex items-center gap-1.5">
                        <StickyNote className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        メモ一覧
                    </h1>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-6">
                {isAccessDenied ? (
                    <AccessDenied />
                ) : (
                    <>
                        <TipsCard {...noteTips} />

                        {canWrite && (
                            <NoteForm
                                babyId={babyId}
                                onAddSuccess={(recordId) => {
                                    mutateNotes()
                                    if (recordId) triggerFeedback("note", recordId)
                                }}
                            />
                        )}

                        {notesLoading ? (
                            <div className="flex justify-center py-10">
                                <BabyBottleLoading className="w-10 h-10 text-amber-400" />
                            </div>
                        ) : (
                            <NoteHistory
                                notes={notes || []}
                                onRefresh={() => mutateNotes()}
                                canWrite={canWrite}
                                initialCommentRecordId={commentRecordId ? parseInt(commentRecordId, 10) : null}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
