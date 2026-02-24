"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface LandingHeaderProps {
    isLoggedIn?: boolean
}

export function LandingHeader({ isLoggedIn = false }: LandingHeaderProps) {
    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-indigo-600">Botoro</span>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">特徴</a>
                    <a href="#details" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">機能</a>
                    <a href="#howto" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">使い方</a>
                    <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">よくある質問</a>
                </nav>
                <div>
                    {isLoggedIn ? (
                        <Link href="/dashboard">
                            <Button variant="ghost" className="text-sm font-medium text-indigo-600">ダッシュボード</Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" className="text-sm font-medium text-slate-600">ログイン</Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
