import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { User } from '@/lib/types';

export type { User };

export function useUser() {
    const { data, error, isLoading, mutate } = useSWR<User>('/auth/me', fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: true, // PWAに戻ったときに再チェック
        revalidateOnMount: true, // マウント時に必ず実行
        dedupingInterval: 0, // 重複排除を無効化して確実に実行
    });

    return {
        user: data,
        isLoading,
        isError: error,
        mutate,
    };
}
