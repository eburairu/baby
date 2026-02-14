import useSWR from "swr";
import { fetcher, api } from "@/lib/api";
import { DailySummary } from "@/types/dailySummary";

export function useDailySummaries(babyId: number | null) {
    const { data, error, isLoading, mutate } = useSWR<DailySummary[]>(
        babyId ? `/babies/${babyId}/daily-summary` : null,
        fetcher,
        { revalidateOnFocus: false }
    );
    return { summaries: data, error, isLoading, mutate };
}

export function useDailySummary(babyId: number | null, summaryDate: string | null) {
    const { data, error, isLoading, mutate } = useSWR<DailySummary>(
        babyId && summaryDate ? `/babies/${babyId}/daily-summary/${summaryDate}` : null,
        fetcher,
        { revalidateOnFocus: false }
    );
    return { summary: data, error, isLoading, mutate };
}

export async function generateDailySummary(
    babyId: number,
    summaryDate: string
): Promise<DailySummary> {
    return api.post<DailySummary>(`/babies/${babyId}/daily-summary`, {
        summary_date: summaryDate,
    });
}

export async function editDailySummary(
    babyId: number,
    summaryDate: string,
    editedContent: string | null
): Promise<DailySummary> {
    return api.patch<DailySummary>(`/babies/${babyId}/daily-summary/${summaryDate}`, {
        edited_content: editedContent,
    });
}

export async function deleteDailySummary(
    babyId: number,
    summaryDate: string
): Promise<void> {
    await api.delete(`/babies/${babyId}/daily-summary/${summaryDate}`);
}
