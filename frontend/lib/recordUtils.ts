import { RECORD_TYPES } from '@/types/enums'

/**
 * レコードのタイプとIDからAPIエンドポイントのURLを生成します。
 *
 * @param type レコードのタイプ (例: "feeding", "sleep", "diaper" など)
 * @param id レコードのID
 * @returns "/feedings/{id}" のようなAPIエンドポイント文字列
 */
export function getRecordEndpoint(type: string, id: number): string {
    switch (type) {
        case RECORD_TYPES.FEEDING:
            return `/feedings/${id}`
        case "sleep":
            return `/sleeps/${id}`
        case "diaper":
            return `/diapers/${id}`
        case "growth":
            return `/growths/${id}`
        case "note":
            return `/notes/${id}`
        case "contraction":
            return `/contractions/${id}`
        default:
            throw new Error(`Unknown record type: ${type}`)
    }
}
