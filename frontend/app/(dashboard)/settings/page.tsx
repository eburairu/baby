"use client"
import { useRouter } from "next/navigation"
import { Users, Baby, User, Moon, LogOut, Bell, Info, ShieldCheck, Heart } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUser } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { api } from "@/lib/api"
import { useState } from "react"
import { AppInfoDialog } from "@/components/settings/AppInfoDialog"
import { SettingItem } from "@/components/settings/SettingItem"
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
        adminOnly: false,
    },
    {
        href: "/settings/notifications",
        icon: Bell,
        label: "通知設定",
        description: "プッシュ通知の構成",
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-950/30",
        adminOnly: false,
    },
    {
        href: "/settings/family",
        icon: Users,
        label: "家族設定",
        description: "家族名・招待コード・メンバー管理",
        color: "text-violet-600",
        bg: "bg-violet-50 dark:bg-violet-950/30",
        adminOnly: false,
    },
    {
        href: "/settings/babies",
        icon: Baby,
        label: "赤ちゃん管理",
        description: "赤ちゃんの情報追加・編集・削除",
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-950/30",
        adminOnly: true,
    },
    {
        href: "/settings/permissions",
        icon: ShieldCheck,
        label: "権限管理",
        description: "メンバーの閲覧アクセス設定",
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        adminOnly: true,
    },
]


export default function SettingsPage() {
    const { user, mutate } = useUser()
    const { isAdmin, isLoading: permsLoading } = usePermissions()
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

    if (permsLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
                <div className="text-gray-400">読み込み中...</div>
            </div>
        )
    }

    const visibleItems = menuItems.filter(
        (item) => !item.adminOnly || isAdmin || user?.is_superadmin
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-zinc-800 h-14 flex items-center justify-center px-4">
                <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">設定</h1>
            </header>

            <div className="max-w-3xl mx-auto p-4 space-y-3 pb-20">
                {user?.is_superadmin && (
                    <section className="space-y-3">
                        <h2 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider ml-1 mb-1">システム管理</h2>
                        <SettingItem
                            href="/admin"
                            icon={ShieldCheck}
                            label="管理者ダッシュボード"
                            description="システム全体の管理・監視"
                            colorClass="text-indigo-600 dark:text-indigo-400"
                            bgClass="bg-indigo-50 dark:bg-indigo-950/30"
                        />
                    </section>
                )}

                <section className="space-y-3">
                    <h2 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider ml-1 mb-1">一般</h2>
                    <SettingItem
                        icon={Moon}
                        label="表示モード"
                        description="ライト・ダーク・システム設定"
                        rightElement={<ThemeToggle />}
                    />
                </section>

                <section className="space-y-3 pt-4">
                    <h2 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider ml-1 mb-1">アカウント・管理</h2>
                    <div className="space-y-2">
                        {visibleItems.map((item) => (
                            <SettingItem
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                description={item.description}
                                colorClass={item.color}
                                bgClass={item.bg}
                            />
                        ))}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <div>
                                    <SettingItem
                                        icon={LogOut}
                                        label="ログアウト"
                                        description="セッションを終了します"
                                        isDestructive
                                        onClick={() => {}}
                                    />
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
                    <div className="space-y-2">
                        <SettingItem
                            href="/about"
                            icon={Heart}
                            label="Botoro について"
                            description="アプリの紹介を見る"
                            colorClass="text-indigo-600 dark:text-indigo-400"
                            bgClass="bg-indigo-50 dark:bg-indigo-950/30"
                        />

                        <SettingItem
                            onClick={() => setAppInfoOpen(true)}
                            icon={Info}
                            label="バージョン情報"
                            description={appVersion ? `v${appVersion.version}` : "読み込み中..."}
                            colorClass="text-slate-600 dark:text-zinc-400"
                            bgClass="bg-slate-100 dark:bg-zinc-800"
                        />
                    </div>
                </section>
            </div>

            <AppInfoDialog open={appInfoOpen} onOpenChange={setAppInfoOpen} />
        </div>
    )
}
