import { BottleContentType, FeedingCompletion } from "@/types/feeding";

export const BOTTLE_CONTENT_TYPES: { value: BottleContentType; label: string }[] = [
    { value: "FORMULA", label: "粉ミルク" },
    { value: "EXPRESSED_MILK", label: "搾母乳" },
    { value: "MIXED", label: "混合" },
];

export const BOTTLE_CONTENT_LABEL: Record<string, string> = BOTTLE_CONTENT_TYPES.reduce((acc, item) => ({
    ...acc,
    [item.value]: item.label
}), {});

export const FEEDING_COMPLETIONS: { value: FeedingCompletion; label: string }[] = [
    { value: "FULL", label: "しっかり飲んだ" },
    { value: "PARTIAL", label: "途中でやめた" },
];

export const COMPLETION_STYLE: Record<string, { label: string; className: string }> = {
    FULL: { label: "しっかり飲んだ", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    PARTIAL: { label: "途中でやめた", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

export const BREAST_SIDE_LABEL: Record<string, string> = {
    LEFT: "左",
    RIGHT: "右",
    BOTH: "両方",
};

export const NEXT_SIDE_GUIDE: Record<string, string> = {
    LEFT: "次回は右から始めましょう",
    RIGHT: "次回は左から始めましょう",
    BOTH: "次回はどちらからでも大丈夫です",
};

export const FEEDING_TYPE_LABELS: Record<string, string> = {
    BREAST: "母乳",
    BOTTLE: "ミルク",
    MIXED: "混合",
};
