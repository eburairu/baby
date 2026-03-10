"use client"
import { Copy, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { api } from "@/lib/api"
import { useClipboard } from "@/hooks/useClipboard"
import { useAsyncAction } from "@/hooks/useAsyncAction"

interface Props {
    inviteCode: string
    isAdmin: boolean
    onRegenerated: () => void
}

export function InviteCodeCard({ inviteCode, isAdmin, onRegenerated }: Props) {
    const { copied, copyToClipboard } = useClipboard()
    const { loading: regenerating, execute } = useAsyncAction()

    const handleCopy = async () => {
        await copyToClipboard(inviteCode)
    }

    const handleRegenerate = async () => {
        await execute(
            async () => {
                await api.post("/family/invite_code/regenerate", {})
                onRegenerated()
            },
            {
                errorMessage: "再生成に失敗しました"
            }
        )
    }

    if (!isAdmin) return null

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-4 transition-colors">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-violet-600 dark:text-violet-400 font-semibold text-sm">🔑 招待コード</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-violet-50 dark:bg-violet-950/30 rounded-lg px-4 py-2 font-mono text-gray-800 dark:text-zinc-300 text-sm">
                    {inviteCode}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    aria-label={copied ? "コピー完了" : "招待コードをコピー"}
                    title="招待コードをコピー"
                    className="dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                    {copied ? <Check className="h-4 w-4 text-green-600 dark:text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            {copied && <p className="text-green-600 dark:text-green-500 text-xs mt-1" role="status">コピーしました ✓</p>}
            <div className="mt-3">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" loading={regenerating} className="dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                            <RefreshCw className="h-4 w-4 mr-1" />
                            再生成
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>招待コードを再生成しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                                既存のコードは無効になります。再生成すると元に戻せません。
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleRegenerate}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                再生成する
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
