"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface LandingCTAProps {
    isLoggedIn?: boolean
}

export function LandingCTA({ isLoggedIn = false }: LandingCTAProps) {
    return (
        <section className="px-4 py-24 bg-indigo-600 text-white">
            <div className="max-w-7xl mx-auto text-center space-y-12">
                <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold tracking-tight">もう、育児の記録で迷わない。</h2>
                    <p className="text-indigo-100 text-lg">
                        今日から家族みんなでシェアして、余裕のある時間を。
                    </p>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                        {isLoggedIn ? (
                            <Link href="/dashboard">
                                <Button className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-white text-indigo-600 hover:bg-indigo-50 rounded-full shadow-xl transition-all">
                                    ダッシュボードに戻る
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/register">
                                <Button className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-white text-indigo-600 hover:bg-indigo-50 rounded-full shadow-xl transition-all hover:-translate-y-0.5">
                                    今すぐ無料で始める
                                </Button>
                            </Link>
                        )}
                    </div>
                    {!isLoggedIn && (
                        <div className="text-indigo-100 text-sm font-medium flex flex-col sm:flex-row items-center gap-2">
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                クレジットカード不要
                            </span>
                            <span className="hidden sm:inline opacity-50">|</span>
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                完全無料
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
