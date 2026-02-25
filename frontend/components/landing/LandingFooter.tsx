"use client"

import Link from "next/link"

export function LandingFooter() {
    return (
        <footer className="px-4 py-12 bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-2">
                        <div className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">Botoro</div>
                        <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs">家族で共有する育児記録アプリ。授乳・睡眠・おむつをリアルタイムで記録・共有。</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                        <div className="space-y-2">
                            <p className="font-bold text-slate-700 dark:text-slate-200">サービス</p>
                            <div className="space-y-1">
                                <a href="#features" className="block text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">特徴</a>
                                <a href="#details" className="block text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">機能一覧</a>
                                <a href="#howto" className="block text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">使い方</a>
                                <a href="#faq" className="block text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">よくある質問</a>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold text-slate-700 dark:text-slate-200">情報</p>
                            <div className="space-y-1">
                                <Link href="/about" className="block text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">運営者情報</Link>
                                <Link href="/privacy" className="block text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">プライバシーポリシー</Link>
                                <Link href="/terms" className="block text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">利用規約</Link>
                                <Link href="/contact" className="block text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">お問い合わせ</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-100 dark:border-zinc-800 pt-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                    &copy; 2026 Botoro. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
