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
            renderDetails={(d) => d.notes ? (
                <div className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">{d.notes}</div>
            ) : null}
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
