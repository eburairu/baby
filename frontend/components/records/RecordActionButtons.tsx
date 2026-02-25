import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface RecordActionButtonsProps {
    onEdit: (e: React.MouseEvent) => void
    onDelete: (e: React.MouseEvent) => void
    canWrite?: boolean
    editLabel?: string
    deleteLabel?: string
}

export function RecordActionButtons({
    onEdit,
    onDelete,
    canWrite = true,
    editLabel = "編集",
    deleteLabel = "削除"
}: RecordActionButtonsProps) {
    if (!canWrite) return null

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-transparent"
                onClick={onEdit}
                aria-label={editLabel}
            >
                <Pencil className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-transparent"
                onClick={onDelete}
                aria-label={deleteLabel}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    )
}
