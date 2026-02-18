"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, Users, Baby, User, Moon, LogOut, Bell, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUser } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { useState } from "react"
import { AppInfoDialog } from "@/components/settings/AppInfoDialog"
import { useAppVersion } from "@/hooks/useAppVersion"
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

const menuItems = [
    {
        href: "/settings/profile",
        icon: User,
        label: "プロフィール設定",
        description: "表示名の変更",
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
        href: "/settings/notifications",
        icon: Bell,
        label: "通知設定",
        description: "プッシュ通知の構成",
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
        href: "/settings/family",
        icon: Users,
        label: "家族設定",
        description: "家族名・招待コード・メンバー管理",
        color: "text-violet-600",
        bg: "bg-violet-50 dark:bg-violet-950/30",
    },
    {
        href: "/settings/babies",
        icon: Baby,
        label: "赤ちゃん管理",
        description: "赤ちゃんの情報追加・編集・削除",
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-950/30",
    },
]

export default function SettingsPage() {
    const { mutate } = useUser()
    const router = useRouter()
    const [appInfoOpen, setAppInfoOpen] = useState(false)
    const { appVersion } = useAppVersion()

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout", {})
            await mutate() // clear user state
            router.push("/login")
        } catch (e) {
            console.error("Logout failed", e)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-zinc-800 h-14 flex items-center justify-center px-4">
                <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">設定</h1>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-3 pb-20">
                <section className="space-y-3">
                    <h2 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider ml-1 mb-1">一般</h2>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-4 flex items-center gap-4 transition-colors">
                        <div className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800">
                            <Moon className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">表示モード</p>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">ライト・ダーク・システム設定</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </section>

                <section className="space-y-3 pt-4">
                    <h2 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider ml-1 mb-1">アカウント・管理</h2>
                    <div className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                                        <div className={`p-2 rounded-xl ${item.bg}`}>
                                            <Icon className={`h-5 w-5 ${item.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">{item.label}</p>
                                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{item.description}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-400 dark:text-zinc-600" />
                                    </div>
                                </Link>
                            )
                        })}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer group">
                                    <div className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                                        <LogOut className="h-5 w-5 text-gray-600 dark:text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-zinc-100 text-sm group-hover:text-red-600 dark:group-hover:text-red-400">ログアウト</p>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">セッションを終了します</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400 dark:text-zinc-600" />
                                </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="dark:text-zinc-100">ログアウトしますか？</AlertDialogTitle>
                                    <AlertDialogDescription className="dark:text-zinc-400">
                                        ログアウトすると、再度ログインが必要になります。
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">キャンセル</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                                        ログアウト
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </section>

                <section className="space-y-3 pt-4">
                    <h2 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider ml-1 mb-1">アプリ情報</h2>
                    <div
                        onClick={() => setAppInfoOpen(true)}
                        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800">
                            <Info className="h-5 w-5 text-slate-600 dark:text-zinc-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">バージョン情報</p>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                                {appVersion ? `v${appVersion.version}` : "読み込み中..."}
                            </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 dark:text-zinc-600" />
                    </div>
                </section>
            </div>

            <AppInfoDialog open={appInfoOpen} onOpenChange={setAppInfoOpen} />
        </div>
    )
}
