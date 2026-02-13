"use client"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Users, Baby } from "lucide-react"
import { Button } from "@/components/ui/button"

const menuItems = [
    {
        href: "/settings/family",
        icon: Users,
        label: "家族設定",
        description: "家族名・招待コード・メンバー管理",
        color: "text-violet-600",
        bg: "bg-violet-50",
    },
    {
        href: "/settings/babies",
        icon: Baby,
        label: "赤ちゃん管理",
        description: "赤ちゃんの情報追加・編集・削除",
        color: "text-pink-500",
        bg: "bg-pink-50",
    },
]

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm h-14 flex items-center px-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="mr-2">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-base font-semibold text-gray-900">設定</h1>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-3">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className={`p-2 rounded-xl ${item.bg}`}>
                                    <Icon className={`h-5 w-5 ${item.color}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
