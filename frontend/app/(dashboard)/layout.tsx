"use client"
import { useUser } from "@/hooks/useAuth"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, ChevronLeft, Settings, Menu } from "lucide-react"
import { useBabies } from "@/hooks/useData"
import { useBabyStore } from "@/stores/babyStore"
import { cn, getDisplayName } from "@/lib/utils"
import { isBorn } from "@/lib/babyUtils"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetClose,
} from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const ALL_NAV_ITEMS = [
    { label: "ホーム", href: "/", icon: "🏠", prenatal: true, postnatal: true },
    { label: "授乳", href: "/feeding", icon: "🍼", prenatal: false, postnatal: true },
    { label: "おむつ", href: "/diaper", icon: "👶", prenatal: false, postnatal: true },
    { label: "睡眠", href: "/sleep", icon: "💤", prenatal: false, postnatal: true },
    { label: "成長", href: "/growth", icon: "📏", prenatal: false, postnatal: true },
    { label: "陣痛", href: "/contraction", icon: "⏱️", prenatal: true, postnatal: false },
    { label: "日記", href: "/diary", icon: "📝", prenatal: true, postnatal: true },
    { label: "メモ一覧", href: "/note", icon: "📋", prenatal: true, postnatal: true },
    { label: "設定", href: "/settings", icon: "⚙️", prenatal: true, postnatal: true },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, mutate, isError } = useUser()
    const router = useRouter()
    const pathname = usePathname()
    const { babies } = useBabies()
    const { selectedBabyId, setSelectedBabyId } = useBabyStore()
    const [mounted, setMounted] = useState(false)
    const [showTimeoutError, setShowTimeoutError] = useState(false)

    const effectiveId = selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)
    const selectedBaby = babies?.find((b) => String(b.id) === effectiveId)

    useEffect(() => {
        setMounted(true)
        // 10秒待っても読み込み中ならタイムアウトを表示
        const timer = setTimeout(() => {
            if (isLoading) setShowTimeoutError(true)
        }, 10000)
        return () => clearTimeout(timer)
    }, [isLoading])

    useEffect(() => {
        if (mounted && !isLoading && !user) {
            router.push("/login")
        }
    }, [mounted, isLoading, user, router])

    if (!mounted || (isLoading && !showTimeoutError)) return (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 animate-pulse">読み込み中...</p>
            </div>
        </div>
    )

    if (showTimeoutError && isLoading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
                <Card className="w-full max-w-sm dark:bg-zinc-900 border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">接続がタイムアウトしました</CardTitle>
                        <CardDescription>
                            ネットワーク接続を確認するか、再試行してください。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Button onClick={() => window.location.reload()} className="w-full">
                            再読み込み
                        </Button>
                        <Button variant="ghost" onClick={() => router.push("/login")} className="w-full">
                            ログイン画面へ
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!user) return null

    const isSettingsSubPage = pathname.startsWith("/settings/") && pathname !== "/settings"

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans transition-colors duration-300">
            <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100 dark:border-zinc-800">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {isSettingsSubPage ? (
                            <Link href="/settings">
                                <Button variant="ghost" size="icon" className="mr-1 dark:text-zinc-400" aria-label="設定に戻る">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="mr-1 dark:text-zinc-400" aria-label="メニューを開く">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="dark:bg-zinc-900 dark:border-zinc-800">
                                    <SheetHeader>
                                        <SheetTitle className="dark:text-zinc-100" data-sentry-unmask>メニュー</SheetTitle>
                                        <SheetDescription className="dark:text-zinc-400">
                                            機能を選択してください
                                        </SheetDescription>
                                    </SheetHeader>
                                    <nav className="mt-6 flex flex-col gap-2" data-sentry-unmask>
                                        {ALL_NAV_ITEMS
                                            .filter(item => {
                                                const born = selectedBaby ? isBorn(selectedBaby.birthday) : true
                                                return born ? item.postnatal : item.prenatal
                                            })
                                            .map((item) => (
                                                <SheetClose asChild key={item.href}>
                                                    <Link href={item.href} className="w-full">
                                                        <Button variant="ghost" className="w-full justify-start text-lg h-12 dark:text-zinc-300 dark:hover:bg-zinc-800" aria-label={item.label}>
                                                            <span className="mr-3 text-xl">{item.icon}</span>
                                                            {item.label}
                                                        </Button>
                                                    </Link>
                                                </SheetClose>
                                            ))}
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        )}
                        <Link href="/">
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100" data-sentry-unmask>Baby App</h1>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <div className="h-8 w-24 bg-gray-100 dark:bg-zinc-800 animate-pulse rounded-full" />
                        ) : user ? (
                            <>
                                {selectedBaby ? (
                                    babies && babies.length > 1 ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground dark:bg-zinc-800 dark:text-zinc-300 hover:bg-secondary/80 dark:hover:bg-zinc-700 transition-colors">
                                                    🍼 {selectedBaby.name}
                                                    <ChevronDown className="h-3 w-3 opacity-60" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="dark:bg-zinc-900 dark:border-zinc-800">
                                                {babies.map((baby) => (
                                                    <DropdownMenuItem
                                                        key={baby.id}
                                                        onClick={() => setSelectedBabyId(String(baby.id))}
                                                        className="flex items-center gap-2 cursor-pointer dark:text-zinc-300 dark:focus:bg-zinc-800"
                                                    >
                                                        <Check
                                                            className={cn("h-4 w-4", String(baby.id) === effectiveId ? "opacity-100" : "opacity-0")}
                                                        />
                                                        {baby.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs dark:bg-zinc-800 dark:text-zinc-300 border-0">
                                            🍼 {selectedBaby.name}
                                        </Badge>
                                    )
                                ) : null}
                                <span className="text-sm text-gray-500 dark:text-zinc-400 hidden sm:inline-block">
                                    Welcome, {getDisplayName(user)}
                                </span>
                                <div className="flex items-center gap-1">
                                    <ThemeToggle />
                                    <Link href="/settings">
                                        <Button variant="ghost" size="icon" className="text-gray-500 dark:text-zinc-400" aria-label="設定">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
            <ScrollToTopButton />
        </div>
    )
}
