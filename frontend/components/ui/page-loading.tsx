import { BabyBottleLoading } from "@/components/ui/baby-bottle-loading"

export function PageLoading({ message = "読み込み中..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-gray-400 dark:text-zinc-500 transition-colors">
      <BabyBottleLoading className="h-16 w-16 text-indigo-400" />
      <p className="text-sm font-medium animate-pulse text-indigo-400/80">{message}</p>
    </div>
  )
}
