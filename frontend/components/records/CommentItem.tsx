import { USER_ROLES } from "@/types/enums"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// NOTE: import the type from where you define it, or declare it inline if you prefer.
// Assuming Comment type looks somewhat like this based on usage:
export interface CommentData {
  id: number
  is_ai_generated: boolean
  ai_has_concern?: boolean
  created_at: string | Date
  content: string
  user_role?: string
  user_display_name?: string
  user_id?: number
}

interface CommentItemProps {
  comment: CommentData
  currentUserId?: number
  onDelete: (id: number) => void
  isDeleting: boolean
}

export function CommentItem({ comment, currentUserId, onDelete, isDeleting }: CommentItemProps) {
  if (comment.is_ai_generated) {
    return (
      <div
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
            {comment.ai_has_concern ? "⚠️ AI フィードバック（要確認）" : "🤖 AIフィードバック"}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            {format(new Date(comment.created_at), "M/d HH:mm", { locale: ja })}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {comment.content}
        </p>
      </div>
    )
  }

  return (
    <div
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

      {currentUserId === comment.user_id && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isDeleting}
              aria-label="コメントを削除"
              className="absolute top-2 right-2 h-6 w-6 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-transparent"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>コメントを削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消せません。本当に削除してよろしいですか？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(comment.id)}
                className="bg-red-500 hover:bg-red-600 focus-visible:ring-red-600"
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
