"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { getDisplayName } from "@/lib/utils"

export default function ProfileSettingsPage() {
    const { user, mutate } = useUser()
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [displayName, setDisplayName] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    // 初期値をセット
    const handleEditStart = () => {
        setDisplayName(user?.display_name || "")
        setIsEditing(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const updatedUser = await api.patch("/auth/me", {
                display_name: displayName,
            })
            await mutate(updatedUser) // SWRのキャッシュを更新
            setIsEditing(false)
            toast.success("プロフィールを更新しました", {
                description: "表示名が変更されました",
            })
        } catch (e) {
            toast.error("エラーが発生しました", {
                description: "プロフィールの更新に失敗しました",
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm h-14 flex items-center px-4">
                <Link href="/settings">
                    <Button variant="ghost" size="icon" className="mr-2">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-base font-semibold text-gray-900">プロフィール設定</h1>
            </header>

            <div className="max-w-md mx-auto p-4">
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                    <div className="flex flex-col items-center gap-3 pb-6 border-b border-gray-100">
                        <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                            <User className="h-10 w-10" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900">{getDisplayName(user)}</h2>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">ユーザー名（ログインID）</Label>
                            <Input
                                id="username"
                                value={user.username}
                                disabled
                                className="bg-gray-50 text-gray-500"
                            />
                            <p className="text-xs text-gray-400">ユーザー名は変更できません</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="displayName">表示名</Label>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <Input
                                        id="displayName"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="表示名を入力"
                                        maxLength={50}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            保存
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isSaving}
                                        >
                                            キャンセル
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        ※空欄にして保存するとユーザー名が表示されます
                                    </p>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <span className="text-gray-900 text-sm">
                                        {user.display_name || <span className="text-gray-400 italic">未設定（ユーザー名を表示）</span>}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={handleEditStart} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                        変更
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
