import { Temperature, TemperatureCreate, TemperatureUpdate } from '@/types/temperature'
import { useBaseRecord } from './useBaseRecord'

/**
 * 体温記録を扱うフック
 */
export function useTemperatures(babyId: string | number | null) {
    const {
        data: temperatures,
        isLoading,
        isError,
        add,
        update,
        remove,
        refresh,
    } = useBaseRecord<Temperature, TemperatureCreate, TemperatureUpdate>(babyId, 'temperatures')

    return {
        temperatures,
        isLoading,
        isError,
        addTemperature: add,
        updateTemperature: update,
        deleteTemperature: remove,
        mutate: refresh,
    }
}
