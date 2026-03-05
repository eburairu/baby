import { TipsCard } from "@/components/ui/tips-card"
import { diaperTips } from "@/lib/tips-data"

export default function TestPage() {
  return (
    <div className="p-8 max-w-md mx-auto bg-white dark:bg-zinc-950 min-h-screen">
      <h1 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Tips Card Focus Test</h1>

      {/* Test elements around the card to test tab order */}
      <button className="mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none">
        Before Card Button
      </button>

      <TipsCard
        storageKey="test-tips-focus"
        color="amber"
        tips={diaperTips.tips}
      />

      <button className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none">
        After Card Button
      </button>
    </div>
  )
}
