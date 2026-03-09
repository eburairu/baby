import { RECORD_TYPES } from '@/types/enums';
import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useSWRConfig } from "swr";
import { API_TIMEOUT_MS } from "@/constants";

export type RecordType = typeof RECORD_TYPES.FEEDING | "diaper" | "growth" | "note" | "temperature";

interface FeedbackResponse {
  feedback: string;
  has_concern: boolean;
  comment_id: number;
  record_type: string;
  analyzed_at: string;
  model_name: string;
}

export function useRecordFeedback(babyId: number | string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useSWRConfig();

  const triggerFeedback = useCallback(
    async (recordType: RecordType, recordId: number) => {
      if (!babyId) return;

      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

      try {
        await api.post<FeedbackResponse>(
          `/babies/${babyId}/record-feedback`,
          { record_type: recordType, record_id: recordId },
          { signal: controller.signal }
        );

        // コメント一覧のSWRキャッシュを更新して自動再取得
        mutate(`/records/${recordType}/${recordId}/comments`);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setError("AIフィードバックの取得がタイムアウトしました");
        } else {
          setError("AIフィードバックの取得に失敗しました");
        }
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    },
    [babyId, mutate]
  );

  return { isLoading, error, triggerFeedback };
}
