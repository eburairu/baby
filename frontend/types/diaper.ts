import type { components } from "@/types/generated/api"

// TypeScript enum から const object へ移行。
// DiaperType.WET / z.nativeEnum(DiaperType) 等の既存の使用箇所と互換性を維持しつつ、
// 生成型の union "WET" | "DIRTY" | "BOTH" と型レベルで互換になる。
export const DiaperType = {
    WET: "WET",
    DIRTY: "DIRTY",
    BOTH: "BOTH",
    CLEAN: "CLEAN",
} as const

export type DiaperType = components["schemas"]["DiaperType"]

export type Diaper = components["schemas"]["DiaperResponse"]
export type DiaperUpdate = components["schemas"]["DiaperUpdate"]
export type DiaperCreate = components["schemas"]["DiaperCreate"]
