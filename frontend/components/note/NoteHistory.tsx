"use client"

import { useState } from "react"
import { Note, deleteNote } from "@/hooks/useNotes"
import { RecordMetaItems } from "@/components/records/RecordMetaItems"
import { formatFullDateTime } from "@/lib/dateUtils"
import { Calendar } from "lucide-react"

import { HistoryCard } from "@/components/records/HistoryCard"
import { RecordListItem } from "@/components/records/RecordListItem"
import { RecordActionButtons } from "@/components/records/RecordActionButtons"
import { useRecordDelete } from "@/hooks/useRecordDelete"
import { useRecordComments } from "@/hooks/useRecordComments"
import { NoteEditDialog } from "./NoteEditDialog"

interface Props {
    notes: Note[]
    onRefresh: () => void
    canWrite?: boolean
    initialCommentRecordId?: number | null
}

export function NoteHistory({ notes, onRefresh, canWrite = true, initialCommentRecordId }: Props) {
    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [isEditing, setIsEditing] = useState(false)

    const { setDeleteTargetId, ConfirmDeleteDialog } = useRecordDelete({
        onDelete: async (id) => {
            await deleteNote(id)
        },
        onSuccess: onRefresh,
        resourceName: "メモ"
    });

    const { openComment, CommentDialog } = useRecordComments({
        records: notes,
        recordType: "note",
        initialCommentRecordId,
        getTitle: (n) => `メモ ${formatFullDateTime(n.note_time)}`,
        onCommentChange: onRefresh
    });

    const handleEditStart = (note: Note) => {
        setEditingNote(note)
        setIsEditing(true)
    }

    const isEmpty = !notes || notes.length === 0;

    return (
        <>
            <HistoryCard title="履歴" isEmpty={isEmpty} emptyMessage="メモがまだありません">
                {(notes || []).map((note) => (
                    <RecordListItem
                        key={note.id}
                        className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
                        actions={
                            <RecordActionButtons
                                canWrite={canWrite}
                                onEdit={() => handleEditStart(note)}
                                onDelete={() => setDeleteTargetId(note.id)}
                                editLabel="メモを編集"
                                deleteLabel="メモを削除"
                            />
                        }
                    >
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 font-medium mb-2">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatFullDateTime(note.note_time)}
                            </span>
                            <RecordMetaItems
                                displayName={note.recorded_by_display_name}
                                commentCount={note.comment_count}
                                onCommentClick={() => openComment(note)}
                                className="contents"
                            />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                            {note.content}
                        </p>
                    </RecordListItem>
                ))}
            </HistoryCard>

            <ConfirmDeleteDialog />

            {/* コメントダイアログ */}
            <CommentDialog />

            {/* 編集ダイアログ */}
            <NoteEditDialog
                note={editingNote}
                open={isEditing}
                onOpenChange={setIsEditing}
                onSuccess={onRefresh}
            />
        </>
    )
}
