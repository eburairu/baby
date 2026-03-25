import { RECORD_TYPES } from "@/types/enums"

export function getRecordEndpoint(type: string, id: number): string {
    switch (type) {
        case RECORD_TYPES.FEEDING: return `/feedings/${id}`
        case RECORD_TYPES.SLEEP: return `/sleeps/${id}`
        case RECORD_TYPES.DIAPER: return `/diapers/${id}`
        case RECORD_TYPES.GROWTH: return `/growths/${id}`
        case RECORD_TYPES.NOTE: return `/notes/${id}`
        case RECORD_TYPES.CONTRACTION: return `/contractions/${id}`
        case RECORD_TYPES.TEMPERATURE: return `/temperatures/${id}`
        default: throw new Error(`Unknown record type: ${type}`)
    }
}
