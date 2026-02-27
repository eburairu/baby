import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { Family, FamilyMember } from "@/types/family";

export function useFamilySettings() {
    const { data, error, isLoading, mutate } = useSWR<Family>('/family/', fetcher);
    return {
        family: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useFamilyMembers() {
    const { data, error, isLoading, mutate } = useSWR<FamilyMember[]>('/family/members', fetcher);
    return {
        members: data,
        isLoading,
        isError: error,
        mutate,
    };
}
