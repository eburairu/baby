"use client"
import { useUser } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAppVersion } from "@/hooks/useAppVersion"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronLeft, Settings, Menu } from "lucide-react"
import { useBabies } from "@/hooks/useData"
import { useBabyStore } from "@/stores/babyStore"
import { cn, getDisplayName } from "@/lib/utils"
import { isBorn } from "@/lib/babyUtils"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"

const ALL_NAV_ITEMS = [
    { label: "ホーム", href: "/dashboard", icon: "🏠", prenatal: true, postnatal: true },
    { label: "授乳", href: "/feeding", icon: "🍼", prenatal: false, postnatal: true },
    { label: "おむつ", href: "/diaper", icon: "👶", prenatal: false, postnatal: true },
    { label: "睡眠", href: "/sleep", icon: "💤", prenatal: false, postnatal: true },
    { label: "成長", href: "/growth", icon: "📈", prenatal: false, postnatal: true },
    { label: "メモ", href: "/note", icon: "📝", prenatal: false, postnatal: true },
    { label: "陣痛タイマー", href: "/contraction", icon: "⏱", prenatal: true, postnatal: false },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading: authLoading } = useUser()
    const pathname = usePathname()
    const { babies, isLoading } = useBabies()
    const { selectedBabyId, setSelectedBabyId } = useBabyStore()
    const { appVersion } = useAppVersion()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        if (babies && babies.length > 0 && !selectedBabyId) {
            setSelectedBabyId(String(babies[0].id))
        }
    }, [babies, selectedBabyId, setSelectedBabyId])

    if (authLoading || (isLoading && !babies)) {
        return <DashboardSkeleton />
    }

    if (!user) {
        return null // Will redirect to login
    }

    const selectedBaby = babies?.find(b => String(b.id) === selectedBabyId)
    const born = selectedBaby ? isBorn(selectedBaby.birthday) : false

    const navItems = ALL_NAV_ITEMS.filter(item => {
        if (born) return item.postnatal
        return item.prenatal
    })

    const isTopLevelPage = pathname === "/dashboard"
    const currentPageLabel = navItems.find(item => item.href === pathname)?.label || "育児記録"

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col transition-colors">
            {/* Desktop Navbar */}
            <header className="hidden md:block sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800 shadow-sm transition-colors">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-rose-500 to-indigo-600 bg-clip-text text-transparent">
                            Baby App
                        </Link>
                        <nav className="flex items-center gap-1">
                            {navItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                                        pathname === item.href
                                            ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                                            : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <ThemeToggle />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    <span className="font-medium text-gray-700 dark:text-zinc-200">{getDisplayName(user)}</span>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-1 dark:bg-zinc-900 dark:border-zinc-800">
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer rounded-lg">
                                        <Settings className="h-4 w-4" />
                                        設定
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/privacy" className="flex items-center gap-2 cursor-pointer rounded-lg">
                                        プライバシーポリシー
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/terms" className="flex items-center gap-2 cursor-pointer rounded-lg">
                                        利用規約
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Mobile Navbar */}
            <header className="md:hidden sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800 transition-colors">
                <div className="px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {!isTopLevelPage && (
                            <Link href="/dashboard" className="p-1 -ml-1 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        )}
                        <h1 className="text-base font-bold text-gray-800 dark:text-zinc-100">{currentPageLabel}</h1>
                    </div>

                    <div className="flex items-center gap-1">
                        <NotificationBell />
                        <ThemeToggle />
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 dark:text-zinc-400">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-64 dark:bg-zinc-950 dark:border-zinc-800">
                                <SheetHeader className="text-left border-b border-gray-100 dark:border-zinc-800 pb-4 mb-4">
                                    <SheetTitle className="text-gray-800 dark:text-zinc-100">メニュー</SheetTitle>
                                    <SheetDescription className="text-gray-500 dark:text-zinc-400">
                                        {getDisplayName(user)} さん
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="space-y-1">
                                    {navItems.map(item => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                                pathname === item.href
                                                    ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                                                    : "text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                                            )}
                                        >
                                            <span className="text-lg">{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    ))}
                                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-zinc-800">
                                        <Link
                                            href="/settings"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                                        >
                                            <Settings className="h-4 w-4" />
                                            設定
                                        </Link>
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center uppercase tracking-widest">
                                        v{appVersion?.version}
                                    </p>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation (Only on Postnatal / Main pages) */}
            {born && (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-md border-t border-gray-100 dark:border-zinc-800 px-6 h-16 flex items-center justify-between pb-safe transition-colors">
                    {[
                        { label: "ホーム", href: "/dashboard", icon: "🏠" },
                        { label: "授乳", href: "/feeding", icon: "🍼" },
                        { label: "睡眠", href: "/sleep", icon: "💤" },
                        { label: "おむつ", href: "/diaper", icon: "👶" },
                        { label: "設定", href: "/settings", icon: "⚙️" },
                    ].map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[3rem] transition-all duration-200",
                                pathname === item.href
                                    ? "text-rose-500 dark:text-rose-400 scale-105"
                                    : "text-gray-400 dark:text-zinc-500"
                            )}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            )}

            <div className="flex-1 overflow-auto relative">
                {children}
            </div>

            <ScrollToTopButton />
        </div>
    )
}
