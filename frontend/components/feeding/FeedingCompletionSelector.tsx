import { FEEDING_COMPLETIONS } from "@/constants/feeding"
import { UI_FORMS } from "@/constants/ui-colors"
import { cn } from "@/lib/utils"
import { FeedingCompletion } from "@/types/feeding"

interface Props {
    value: FeedingCompletion | null
    onChange: (value: FeedingCompletion | null) => void
}

export function FeedingCompletionSelector({ value, onChange }: Props) {
    return (
        <div>
            <p className="text-sm font-medium mb-2">授乳完全度</p>
            <div className="flex gap-2">
                {FEEDING_COMPLETIONS.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        aria-pressed={value === item.value}
                        onClick={() => onChange(value === item.value ? null : item.value)}
                        className={cn(
                            "flex-1 rounded-lg border py-2 text-xs font-medium transition-colors",
                            value === item.value
                                ? item.value === "FULL"
                                    ? UI_FORMS.selection.greenSolid.active
                                    : UI_FORMS.selection.amberSolid.active
                                : item.value === "FULL"
                                    ? UI_FORMS.selection.greenSolid.inactive
                                    : UI_FORMS.selection.amberSolid.inactive
                        )}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
