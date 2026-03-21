"use client"
import { Diaper, DiaperType } from "@/types/diaper"
import { formatDateTime } from "@/lib/dateUtils"
import { DiaperEditDialog } from "./DiaperEditDialog"
import { GenericRecordHistory } from "@/components/records/GenericRecordHistory"
import { DIAPER_STYLES, DIAPER_UNKNOWN_STYLE } from "@/constants/diaper"
import { DiaperIcon } from "./DiaperIcon"

/**
 * おむつ記録の履歴表示コンポーネント
 */
interface DiaperHistoryProps {
    diapers: Diaper[]
    onDelete: (id: number) => Promise<void>
    onRefresh: () => void
    canWrite?: boolean
    initialCommentRecordId?: number | null
}

export function DiaperHistory({ 
    diapers, 
    onDelete, 
    onRefresh, 
    canWrite = true, 
    initialCommentRecordId 
}: DiaperHistoryProps) {
    const getStyles = (type: DiaperType) => DIAPER_STYLES[type] || DIAPER_UNKNOWN_STYLE;

    return (
        <GenericRecordHistory<Diaper>
            records={diapers}
            recordType="diaper"
            resourceName="おむつ記録"
            canWrite={canWrite}
            initialCommentRecordId={initialCommentRecordId}
            onRefresh={onRefresh}
            onDelete={onDelete}
            getCommentTitle={(d) => `${getStyles(d.diaper_type).label} ${formatDateTime(d.change_time)}`}
            itemClassName={(d) => {
                const style = getStyles(d.diaper_type);
                return `${style.bg} ${style.border}`;
            }}
            renderIcon={(d) => <DiaperIcon type={d.diaper_type} />}
            renderTitle={(d) => {
                const style = getStyles(d.diaper_type);
                return (
                    <div className={`text-sm font-bold ${style.text}`}>
                        {style.label}
                        <span className="text-xs font-normal text-gray-500 dark:text-zinc-500 ml-2">
                            {formatDateTime(d.change_time)}
                        </span>
                    </div>
                );
            }}
            renderDetails={(d) => {
                const tags = [d.poop_color, d.poop_consistency, d.poop_amount].filter(Boolean)
                const hasTags = tags.length > 0
                const hasNotes = !!d.notes
                if (!hasTags && !hasNotes) return null
                return (
                    <div className="mt-0.5 space-y-1">
                        {hasTags && (
                            <div className="flex flex-wrap gap-1">
                                {tags.map((tag) => (
                                    <span key={tag} className="inline-block px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        {hasNotes && (
                            <div className="text-xs text-gray-600 dark:text-zinc-400">{d.notes}</div>
                        )}
                    </div>
                )
            }}
            renderEditDialog={(target, open, setOpen) => (
                <DiaperEditDialog
                    diaper={target}
                    open={open}
                    onOpenChange={setOpen}
                    onSuccess={() => {
                        setOpen(false);
                        onRefresh();
                    }}
                />
            )}
        />
    )
}
