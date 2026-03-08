import { Diaper, DiaperCreate, DiaperUpdate } from '@/types/diaper';
import { useBaseRecord } from './useBaseRecord';

/**
 * おむつ記録を扱うフック
 */
export function useDiapers(babyId: string | number | null) {
    const {
        data: diapers,
        isLoading,
        isError,
        add,
        update,
        remove,
        refresh,
    } = useBaseRecord<Diaper, DiaperCreate, DiaperUpdate>(babyId, 'diapers', 'diaper_id');

    return {
        diapers,
        isLoading,
        isError,
        addDiaper: add,
        updateDiaper: update,
        deleteDiaper: remove,
        mutate: refresh,
    };
}
