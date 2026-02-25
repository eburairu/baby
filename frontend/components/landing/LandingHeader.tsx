"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface LandingHeaderProps {
    isLoggedIn?: boolean
}

export function LandingHeader({ isLoggedIn = false }: LandingHeaderProps) {
    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">Botoro</span>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">特徴</a>
                    <a href="#details" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">機能</a>
                    <a href="#howto" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">使い方</a>
                    <a href="#faq" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">よくある質問</a>
                </nav>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {isLoggedIn ? (
                        <Link href="/dashboard">
                            <Button variant="ghost" className="text-sm font-medium text-indigo-600 dark:text-indigo-400">ダッシュボード</Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" className="text-sm font-medium text-slate-600 dark:text-slate-400">ログイン</Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
