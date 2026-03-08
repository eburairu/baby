import { Sleep, SleepCreate, SleepUpdate } from '@/types/sleep';
import { useBaseRecord } from './useBaseRecord';

/**
 * 睡眠記録を扱うフック
 */
export function useSleeps(babyId: string | number | null) {
    const {
        data: sleeps,
        isLoading,
        isError,
        add,
        update,
        remove,
        refresh,
    } = useBaseRecord<Sleep, SleepCreate, SleepUpdate>(babyId, 'sleeps');

    return {
        sleeps,
        isLoading,
        isError,
        addSleep: add,
        updateSleep: update,
        deleteSleep: remove,
        mutate: refresh,
    };
}
