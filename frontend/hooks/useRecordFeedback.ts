import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useSWRConfig } from "swr";

type RecordType = "feeding" | "diaper" | "growth" | "note";

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
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        await api.post<FeedbackResponse>(
          `/babies/${babyId}/record-feedback`,
          { record_type: recordType, record_id: recordId }
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
