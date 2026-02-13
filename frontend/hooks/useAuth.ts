import useSWR from 'swr';
import { fetcher } from '@/lib/api';


export interface User {
    id: number;
    username: string;
    family_id: number;
    created_at: string;
}

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
