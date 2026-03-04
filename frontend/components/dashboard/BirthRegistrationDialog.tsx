"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogTrigger, DialogTitle, DialogDescription, DialogFooter, DialogHeader, DialogContent, Dialog } from "@/components/ui/dialog"
import { api, isApiError } from "@/lib/api"
import { PartyPopper } from "lucide-react"

interface Props {
    babyId: string
    babyName: string
    onSuccess: () => void
}

export function BirthRegistrationDialog({ babyId, babyName, onSuccess }: Props) {
    const [open, setOpen] = useState(false)
    const [birthday, setBirthday] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!birthday) return
        setSubmitting(true)
        setError(null)
        try {
            await api.patch(`/babies/${babyId}`, { birthday })
            setOpen(false)
            onSuccess()
        } catch (err: unknown) {
            console.error("誕生日の登録に失敗しました", err)
            setError(
                isApiError(err)
                    ? ((err.info as { detail?: string })?.detail || "誕生日の登録に失敗しました")
                    : "誕生日の登録に失敗しました"
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="w-full h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 dark:from-pink-600 dark:to-rose-500 dark:hover:from-pink-700 dark:hover:to-rose-600 text-white font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2">
                    <PartyPopper className="w-6 h-6" /> 生まれた！
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md dark:bg-zinc-900 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="dark:text-zinc-100 flex items-center gap-2">
                        <PartyPopper className="w-6 h-6 text-pink-500" /> おめでとうございます！
                    </DialogTitle>
                    <DialogDescription className="dark:text-zinc-400">
                        {babyName}の誕生日を登録しましょう。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="birth-date" className="dark:text-zinc-300">誕生日</Label>
                        <Input
                            id="birth-date"
                            type="date"
                            max="9999-12-31"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            required
                            className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                        >
                            キャンセル
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || !birthday}
                            className="bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 text-white"
                        >
                            {submitting ? "登録中..." : "登録する"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
