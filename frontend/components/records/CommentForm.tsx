import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Loader2 } from "lucide-react"

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    setContent("")
    try {
      await onSubmit(trimmed)
    } catch (err) {
      console.error(err)
      setContent(trimmed)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
  )
}
