import useSWR from "swr";

export type CommentResponse = {
  id: number;
  user_id: number;
  user_display_name: string;
  user_role: "admin" | "member" | "viewer" | "unknown";
  content: string;
  created_at: string;
};

export function useComments(recordType: string, recordId: number) {
  const { data, error, mutate, isLoading } = useSWR<CommentResponse[]>(
    `/api/records/${recordType}/${recordId}/comments`,
    { revalidateOnFocus: false }
  );

  const addComment = async (content: string) => {
    const res = await fetch(`/api/records/${recordType}/${recordId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to add comment");
    }
    const newComment = await res.json();
    // Optimistically update
    mutate((prev) => (prev ? [...prev, newComment] : [newComment]), false);
    return newComment;
  };

  const deleteComment = async (commentId: number) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to delete comment");
    }
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
