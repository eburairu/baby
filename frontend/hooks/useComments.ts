import useSWR from "swr";
import { fetcher, api } from "@/lib/api";

export type CommentResponse = {
  id: number;
  user_id: number;
  user_display_name: string;
  user_role: "admin" | "member" | "viewer" | "unknown";
  content: string;
  created_at: string;
};

export function useComments(recordType: string, recordId: number) {
  // fetcher を追加し、パスをプロジェクトの慣習に合わせる（/api は fetcher が付与する場合が多いが、他と合わせる）
  const { data, error, mutate, isLoading } = useSWR<CommentResponse[]>(
    `/records/${recordType}/${recordId}/comments`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const addComment = async (content: string) => {
    // api ヘルパーを使用して POST
    const res = await api.post(`/records/${recordType}/${recordId}/comments`, { content });
    const newComment = res;
    // Optimistically update
    mutate((prev) => (prev ? [...prev, newComment] : [newComment]), false);
    return newComment;
  };

  const deleteComment = async (commentId: number) => {
    // api ヘルパーを使用して DELETE
    await api.delete(`/comments/${commentId}`);
    mutate((prev) => (prev ? prev.filter((c) => c.id !== commentId) : []), false);
  };

  return {
    comments: data,
    isLoading,
    error,
    addComment,
    deleteComment,
  };
}
