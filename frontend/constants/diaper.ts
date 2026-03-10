export const POOP_COLORS = ["黄色", "緑", "茶色", "黒", "白", "その他"] as const;
export const POOP_AMOUNTS = ["少量", "普通", "多量", "その他"] as const;

import { DiaperType } from "@/types/diaper";

export const DIAPER_STYLES: Record<DiaperType, { bg: string; border: string; text: string; label: string }> = {
    [DiaperType.WET]: {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        border: "border-blue-100 dark:border-blue-900/50",
        text: "text-blue-700 dark:text-blue-400",
        label: "おしっこ"
    },
    [DiaperType.DIRTY]: {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-amber-100 dark:border-amber-900/50",
        text: "text-amber-700 dark:text-amber-400",
        label: "うんち"
    },
    [DiaperType.BOTH]: {
        bg: "bg-purple-50 dark:bg-purple-950/30",
        border: "border-purple-100 dark:border-purple-900/50",
        text: "text-purple-700 dark:text-purple-400",
        label: "両方"
    }
};

export const DIAPER_UNKNOWN_STYLE = {
    bg: "bg-gray-50 dark:bg-zinc-800/50",
    border: "border-gray-100 dark:border-zinc-700",
    text: "text-gray-700 dark:text-zinc-400",
    label: "不明"
};
