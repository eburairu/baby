"use client";

import { useState } from "react";
import { useComments } from "@/hooks/useComments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Trash2, Heart } from "lucide-react";
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
  const { comments, addComment, deleteComment, isLoading } = useComments(recordType, recordId);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(content.trim());
      setContent("");
      onCommentChange?.();
    } catch (err) {
      console.error(err);
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
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <MessageCircle className="w-4 h-4" />
        <span>コメント・応援メッセージ</span>
        {comments && comments.length > 0 && (
          <Badge variant="secondary" className="px-1.5 py-0.5 h-auto text-[10px]">
            {comments.length}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {comments?.map((comment) => (
          <div
            key={comment.id}
            className={cn(
              "p-3 rounded-lg text-sm relative group transition-colors",
              comment.user_role === "viewer"
                ? "bg-orange-50 border border-orange-100"
                : "bg-gray-50 border border-gray-100"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">
                  {comment.user_display_name}
                </span>
                {comment.user_role === "viewer" && (
                  <Badge className="bg-orange-200 text-orange-800 border-none text-[10px] h-4 px-1">
                    応援
                  </Badge>
                )}
                {comment.user_role === "admin" && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                    管理者
                  </Badge>
                )}
              </div>
              <span className="text-[10px] text-gray-500">
                {format(new Date(comment.created_at), "M/d HH:mm", { locale: ja })}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
            
            {(currentUserId === comment.user_id) && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {comments?.length === 0 && !isLoading && (
          <p className="text-xs text-gray-400 text-center py-2">
            メッセージを送って育児を応援しましょう！
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="お疲れ様！応援メッセージを送ろう"
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
              "送信中..."
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
