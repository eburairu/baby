import { useState } from "react"
import { User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, User as UserType } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { getDisplayName } from "@/lib/utils"
import { SettingsHeader } from "@/components/settings/SettingsHeader"

export default function ProfileSettingsPage() {
    const { user, mutate } = useUser()
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
            const updatedUser = await api.patch<UserType>("/auth/me", {
                display_name: displayName,
            })
            await mutate(updatedUser) // SWRのキャッシュを更新
            setIsEditing(false)
            toast.success("プロフィールを更新しました", {
                description: "表示名が変更されました",
            })
        } catch {
            toast.error("エラーが発生しました", {
                description: "プロフィールの更新に失敗しました",
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
            <SettingsHeader title="プロフィール設定" />

            <div className="max-w-md mx-auto p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-6 space-y-6">
                    <div className="flex flex-col items-center gap-3 pb-6 border-b border-gray-100 dark:border-zinc-800">
                        <div className="h-20 w-20 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 transition-colors">
                            <User className="h-10 w-10" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">{getDisplayName(user)}</h2>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">@{user.username}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="dark:text-zinc-300">ユーザー名（ログインID）</Label>
                            <Input
                                id="username"
                                value={user.username}
                                disabled
                                className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-zinc-500 border-gray-200 dark:border-zinc-800"
                            />
                            <p className="text-xs text-gray-400 dark:text-zinc-600">ユーザー名は変更できません</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="displayName" className="dark:text-zinc-300">表示名</Label>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <Input
                                        id="displayName"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="表示名を入力"
                                        maxLength={50}
                                        autoFocus
                                        className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            保存
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isSaving}
                                        >
                                            キャンセル
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-zinc-600">
                                        ※空欄にして保存するとユーザー名が表示されます
                                    </p>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-md border border-gray-200 dark:border-zinc-800">
                                    <span className="text-gray-900 dark:text-zinc-100 text-sm">
                                        {user.display_name || <span className="text-gray-400 dark:text-zinc-600 italic">未設定（ユーザー名を表示）</span>}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={handleEditStart} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30">
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
