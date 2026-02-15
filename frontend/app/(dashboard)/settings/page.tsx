"use client"
import Link from "next/link"
import { ChevronRight, Users, Baby, User, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

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
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-zinc-800 h-14 flex items-center justify-center px-4">
                <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">設定</h1>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-3">
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
                </section>
            </div>
        </div>
    )
}
