import useSWR from 'swr';
import { fetcher } from '@/lib/api';

export function useUser() {
    const { data, error, isLoading, mutate } = useSWR('/auth/me', fetcher, {
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
