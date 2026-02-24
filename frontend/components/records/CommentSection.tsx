"use client"
import { USER_ROLES } from '@/types/enums';
;

import { useState } from "react";
import { useComments } from "@/hooks/useComments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Trash2, Heart, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  recordType: string;
  recordId: number;
  currentUserId?: number;
  onCommentChange?: () => void;
}

export function CommentSection({ recordType, recordId, currentUserId, onCommentChange }: CommentSectionProps) {
  const { comments, addComment, deleteComment, isLoading, error } = useComments(recordType, recordId);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setContent("");
    try {
      await addComment(trimmed);
      onCommentChange?.();
    } catch (err) {
      console.error(err);
      setContent(trimmed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      onCommentChange?.();
    } catch (err) {
      console.error(err);
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

        {!isLoading && !error ? comments?.map((comment) => {
          if (comment.is_ai_generated) {
            return (
              <div
                key={comment.id}
                className={cn(
                  "p-3 rounded-lg text-sm transition-colors",
                  comment.ai_has_concern
                    ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                    : "bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "font-semibold text-sm",
                    comment.ai_has_concern
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-indigo-700 dark:text-indigo-400"
                  )}>
                    {comment.ai_has_concern ? "⚠️ AIフィードバック（要確認）" : "🤖 AIフィードバック"}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {format(new Date(comment.created_at), "M/d HH:mm", { locale: ja })}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
              </div>
            );
          }

          return (
            <div
              key={comment.id}
              className={cn(
                "p-3 rounded-lg text-sm relative group transition-colors",
                comment.user_role === USER_ROLES.VIEWER
                  ? "bg-orange-50 border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900"
                  : "bg-gray-50 border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {comment.user_display_name}
                  </span>
                  {comment.user_role === USER_ROLES.VIEWER && (
                    <Badge className="bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200 border-none text-[10px] h-4 px-1">
                      応援
                    </Badge>
                  )}
                  {comment.user_role === USER_ROLES.ADMIN && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1">
                      管理者
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {format(new Date(comment.created_at), "M/d HH:mm", { locale: ja })}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </p>

              {(currentUserId === comment.user_id) && (
                <button
                  onClick={() => {
                    if (window.confirm("このコメントを削除しますか？")) {
                      handleDelete(comment.id);
                    }
                  }}
                  aria-label="コメントを削除"
                  className="absolute top-2 right-2 p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        }) : null}

        {comments?.length === 0 && !isLoading && !error ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
            メッセージを送って育児を応援しましょう！
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
          placeholder="お疲れ様！応援メッセージを送ろう"
          aria-label="応援メッセージ"
          className="text-sm min-h-[60px] resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                送信中...
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5 mr-1.5 fill-current" />
                応援を送る
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
