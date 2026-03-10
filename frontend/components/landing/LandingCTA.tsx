"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface LandingCTAProps {
    isLoggedIn?: boolean
}

export function LandingCTA({ isLoggedIn = false }: LandingCTAProps) {
    return (
        <section className="px-4 py-24 bg-indigo-600 dark:bg-indigo-950/40 dark:border-y dark:border-indigo-900/50 text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto text-center space-y-12">
                <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold tracking-tight">もう、育児の記録で迷わない。</h2>
                    <p className="text-indigo-100 dark:text-indigo-200 text-lg">
                        今日から家族みんなでシェアして、余裕のある時間を。
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {isLoggedIn ? (
                        <Link href="/dashboard">
                            <Button className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-700 rounded-2xl shadow-xl dark:shadow-none transition-all">
                                ダッシュボードに戻る
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/register">
                            <Button className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-700 rounded-2xl shadow-xl dark:shadow-none transition-all">
                                今すぐ無料で始める
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    )
}
