"use client"
import { useState } from "react";
import { useComments } from "@/hooks/useComments";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { CommentItem, CommentData } from "./CommentItem";
import { CommentForm } from "./CommentForm";

interface CommentSectionProps {
  recordType: string;
  recordId: number;
  currentUserId?: number;
  onCommentChange?: () => void;
}

export function CommentSection({ recordType, recordId, currentUserId, onCommentChange }: CommentSectionProps) {
  const { comments, addComment, deleteComment, isLoading, error } = useComments(recordType, recordId);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSubmit = async (content: string) => {
    await addComment(content);
    onCommentChange?.();
  };

  const handleDelete = async (commentId: number) => {
    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      onCommentChange?.();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-4 border-t pt-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <MessageCircle className="w-4 h-4" />
        <span>コメント・応援メッセージ</span>
        {comments && comments.length > 0 && (
          <Badge variant="secondary" className="px-1.5 py-0.5 h-auto text-[10px]">
            {comments.length}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-4 text-gray-400 dark:text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-xs">読み込み中...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-4 text-red-400 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-xs">メッセージの取得に失敗しました</span>
          </div>
        )}

        {!isLoading && !error ? comments?.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment as unknown as CommentData}
            currentUserId={currentUserId}
            onDelete={handleDelete}
            isDeleting={deletingId === comment.id}
          />
        )) : null}

        {comments?.length === 0 && !isLoading && !error ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-gray-200 dark:border-zinc-800">
            <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">メッセージを送って育児を応援しましょう！</p>
          </div>
        ) : null}
      </div>

      <CommentForm onSubmit={handleSubmit} />
    </div>
  );
}
