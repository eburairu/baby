import type { components } from "@/types/generated/api"

export const TemperatureMethod = {
    AXILLARY: "AXILLARY",
    EAR: "EAR",
    FOREHEAD: "FOREHEAD",
    RECTAL: "RECTAL",
} as const

export type TemperatureMethod = components["schemas"]["TemperatureMethod"]

export type Temperature = components["schemas"]["TemperatureResponse"]
export type TemperatureCreate = components["schemas"]["TemperatureCreate"]
export type TemperatureUpdate = components["schemas"]["TemperatureUpdate"]

export const TEMPERATURE_METHOD_LABELS: Record<TemperatureMethod, string> = {
    AXILLARY: "わきの下",
    EAR: "耳",
    FOREHEAD: "額",
    RECTAL: "直腸",
}

export const FEVER_THRESHOLD = 37.5
export const HIGH_FEVER_THRESHOLD = 38.0

export type FeverStatus = "high_fever" | "fever" | "normal"

export function getFeverStatus(temp: number): FeverStatus {
    if (temp >= HIGH_FEVER_THRESHOLD) return "high_fever"
    if (temp >= FEVER_THRESHOLD) return "fever"
    return "normal"
}
