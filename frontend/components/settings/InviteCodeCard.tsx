"use client"
import { useState } from "react"
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

interface Props {
    inviteCode: string
    isAdmin: boolean
    onRegenerated: () => void
}

export function InviteCodeCard({ inviteCode, isAdmin, onRegenerated }: Props) {
    const [copied, setCopied] = useState(false)
    const [regenerating, setRegenerating] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(inviteCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleRegenerate = async () => {
        setRegenerating(true)
        try {
            await api.post("/family/invite_code/regenerate", {})
            onRegenerated()
        } catch {
            // エラー時はトースト等を表示（簡略化のため省略）
        } finally {
            setRegenerating(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-violet-600 font-semibold text-sm">🔑 招待コード</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-violet-50 rounded-lg px-4 py-2 font-mono text-gray-800 text-sm">
                    {inviteCode}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    aria-label={copied ? "コピー完了" : "招待コードをコピー"}
                    title="招待コードをコピー"
                >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            {copied && <p className="text-green-600 text-xs mt-1" role="status">コピーしました ✓</p>}
            {isAdmin && (
                <div className="mt-3">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" loading={regenerating}>
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
            )}
        </div>
    )
}
