import { User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordMetaItemsProps {
  /** The display name of the user who recorded the entry */
  displayName?: string | null;
  /** Number of comments on this record */
  commentCount?: number;
  /** Callback when the comment button is clicked */
  onCommentClick?: () => void;
  /** Additional class names */
  className?: string;
}

export function RecordMetaItems({
  displayName,
  commentCount = 0,
  onCommentClick,
  className,
}: RecordMetaItemsProps) {
  return (
    <div className={cn("flex items-center gap-2 text-[10px] text-gray-500 flex-wrap", className)}>
      {displayName && (
        <span className="inline-flex items-center gap-0.5 text-gray-400 dark:text-zinc-500">
          <User className="w-3 h-3" />
          {displayName}
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCommentClick?.();
        }}
        aria-haspopup="dialog"
        aria-label={commentCount > 0 ? `${commentCount}件のコメントを表示` : "コメントを追加"}
        title={commentCount > 0 ? `${commentCount}件のコメントを表示` : "コメントを追加"}
        className="inline-flex items-center gap-0.5 text-gray-400 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 rounded-sm outline-none"
      >
        <MessageCircle className="w-3 h-3" />
        {commentCount > 0 && <span>{commentCount}</span>}
      </button>
    </div>
  );
}
