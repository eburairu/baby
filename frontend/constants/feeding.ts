import { BottleContentType, FeedingCompletion } from "@/types/feeding";

export const BOTTLE_CONTENT_TYPES: { value: BottleContentType; label: string }[] = [
    { value: "FORMULA", label: "粉ミルク" },
    { value: "EXPRESSED_MILK", label: "搾母乳" },
    { value: "MIXED", label: "混合" },
];

export const FEEDING_COMPLETIONS: { value: FeedingCompletion; label: string }[] = [
    { value: "FULL", label: "しっかり飲んだ" },
    { value: "PARTIAL", label: "途中でやめた" },
];
