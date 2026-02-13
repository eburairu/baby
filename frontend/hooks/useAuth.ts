import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { User } from '@/lib/types';

export function useUser() {
    const { data, error, isLoading, mutate } = useSWR<User>('/auth/me', fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: false,
    });

    return {
        user: data,
        isLoading,
        isError: error,
        mutate,
    };
}
