"use client"
import { useUser } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAppVersion } from "@/hooks/useAppVersion"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, ChevronLeft, Settings, Menu, Home, Milk, Moon, Baby, Ruler, StickyNote, BookOpen, Timer, Syringe, Trophy } from "lucide-react"
import { useSelectedBaby } from "@/hooks/useSelectedBaby"
import { cn, getDisplayName } from "@/lib/utils"
import { isBorn } from "@/lib/babyUtils"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { Badge } from "@/components/ui/badge"
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import type { LucideIcon } from "lucide-react"

const ALL_NAV_ITEMS: {
    label: string
    href: string
    Icon: LucideIcon
    color: string
    prenatal: boolean
    postnatal: boolean
}[] = [
    { label: "ホーム",       href: "/dashboard",   Icon: Home,       color: "text-pink-500",    prenatal: true,  postnatal: true  },
    { label: "授乳",         href: "/feeding",     Icon: Milk,       color: "text-pink-500",    prenatal: false, postnatal: true  },
    { label: "睡眠",         href: "/sleep",       Icon: Moon,       color: "text-violet-500",  prenatal: false, postnatal: true  },
    { label: "おむつ",       href: "/diaper",      Icon: Baby,       color: "text-amber-500",   prenatal: false, postnatal: true  },
    { label: "成長",         href: "/growth",      Icon: Ruler,      color: "text-emerald-500", prenatal: false, postnatal: true  },
    { label: "予防接種",     href: "/vaccinations",Icon: Syringe,    color: "text-sky-500",     prenatal: false, postnatal: true  },
    { label: "発育発達マイルストーン",href: "/milestones",  Icon: Trophy,     color: "text-yellow-500",  prenatal: false, postnatal: true  },
    { label: "メモ",         href: "/note",        Icon: StickyNote, color: "text-orange-400",  prenatal: false, postnatal: true  },
    { label: "日誌",         href: "/diary",       Icon: BookOpen,   color: "text-indigo-400",  prenatal: false, postnatal: true  },
    { label: "陣痛タイマー", href: "/contraction", Icon: Timer,      color: "text-red-500",     prenatal: true,  postnatal: false },
]

const BOTTOM_NAV_ITEMS: {
    label: string
    href: string
    Icon: LucideIcon
    color: string
}[] = [
    { label: "ホーム",   href: "/dashboard", Icon: Home,       color: "text-pink-500" },
    { label: "授乳",     href: "/feeding",   Icon: Milk,       color: "text-pink-500" },
    { label: "睡眠",     href: "/sleep",     Icon: Moon,       color: "text-violet-500" },
    { label: "おむつ",   href: "/diaper",    Icon: Baby,       color: "text-amber-500" },
    { label: "成長",     href: "/growth",    Icon: Ruler,      color: "text-emerald-500" },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading: authLoading } = useUser()
    const pathname = usePathname()
    const { babies, isLoading, selectedBabyId, setSelectedBabyId, selectedBaby } = useSelectedBaby()
    const { appVersion } = useAppVersion()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // 認証が完了し、ユーザーが存在しない場合のみリダイレクト
    if (!authLoading && !user) {
        return null
    }

    const born = selectedBaby ? isBorn(selectedBaby.birthday) : false

    const navItems = ALL_NAV_ITEMS.filter(item => {
        if (born) return item.postnatal
        return item.prenatal
    })

    const isTopLevelPage = pathname === "/dashboard"
    const currentPageLabel = navItems.find(item => item.href === pathname)?.label || "育児記録"

    const babySelector = authLoading || (isLoading && !babies) ? (
        <Skeleton className="h-6 w-24 rounded-full" />
    ) : selectedBaby ? (
        babies && babies.length > 1 ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                        <Baby className="w-4 h-4 opacity-80" />
                        <span className="font-medium">{selectedBaby.name}</span>
                        <ChevronDown className="h-3 w-3 opacity-60" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1 dark:bg-zinc-900 dark:border-zinc-800">
                    {babies.map((baby) => (
                        <DropdownMenuItem
                            key={baby.id}
                            onClick={() => setSelectedBabyId(String(baby.id))}
                            className="flex items-center gap-2 cursor-pointer rounded-lg dark:text-zinc-300"
                        >
                            <Check
                                className={cn("h-4 w-4 text-rose-500", String(baby.id) === selectedBabyId ? "opacity-100" : "opacity-0")}
                            />
                            {baby.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        ) : (
            <Badge variant="secondary" className="text-xs font-medium dark:bg-zinc-800 dark:text-zinc-300 border-0 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Baby className="w-4 h-4 opacity-80" />
                {selectedBaby.name}
            </Badge>
        )
    ) : null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col transition-colors">
            {/* Desktop Navbar */}
            <header className="hidden md:block sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800 shadow-sm transition-colors">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-rose-500 to-indigo-600 bg-clip-text text-transparent">
                            Botoro
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
                        {babySelector}
                        <div className="w-px h-4 bg-gray-200 dark:bg-zinc-800 mx-1" />
                        <NotificationBell />
                        <ThemeToggle />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    {authLoading ? (
                                        <Skeleton className="h-4 w-20" />
                                    ) : (
                                        <span className="font-medium text-gray-700 dark:text-zinc-200">{getDisplayName(user)}</span>
                                    )}
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
                        {babySelector}
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
                                        {authLoading ? (
                                            <Skeleton className="h-4 w-24 inline-block" />
                                        ) : (
                                            <>{getDisplayName(user)} さん</>
                                        )}
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
                                            <item.Icon className={cn("h-5 w-5", pathname === item.href && item.color)} />
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
                    {BOTTOM_NAV_ITEMS.map(item => (
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
                            <item.Icon className={cn("h-6 w-6", pathname === item.href && item.color)} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            )}

            <div className="flex-1 overflow-auto relative">
                <Suspense fallback={null}>
                    {children}
                </Suspense>
            </div>

            <ScrollToTopButton hasBottomBar={born} />
        </div>
    )
}
