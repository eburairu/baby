"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingHeroProps {
    isLoggedIn?: boolean
}

export function LandingHero({ isLoggedIn = false }: LandingHeroProps) {
    return (
        <section className="relative px-4 py-12 lg:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center lg:text-left space-y-8"
                >
                    <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                        「いつミルクあげた？」<br />
                        その確認、もう不要です。<br />
                        <span className="text-indigo-600">リアルタイム育児記録</span>で、<br className="hidden lg:block" />夫婦の連携をもっとスムーズに。
                    </h1>
                    <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0">
                        授乳、睡眠、おむつ交換。スマホでタップするだけで、パートナーに即通知。
                        AIアドバイスで、初めての育児も安心サポート。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center sm:items-start">
                        {isLoggedIn ? (
                            <Link href="/dashboard">
                                <Button className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-105">
                                    ダッシュボードに戻る
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2 w-full sm:w-auto items-center sm:items-start">
                                    <Link href="/register" className="w-full sm:w-auto">
                                        <Button className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-105">
                                            無料でアカウント作成
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <div className="text-xs font-bold mt-2 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-slate-500">
                                        <span>✨ クレジットカード不要・完全無料</span>
                                        <span className="hidden sm:inline text-slate-300">|</span>
                                        <span className="text-indigo-600">1分で登録完了</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative mx-auto lg:mx-0"
                >
                    <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-indigo-100 to-rose-50 rounded-full blur-3xl opacity-50 absolute -z-10 animate-pulse" />
                    <img
                        src="/hero-image.png"
                        alt="App Screenshot"
                        className="relative z-10 w-full max-w-md mx-auto drop-shadow-2xl rounded-[2.5rem] border-8 border-white"
                        onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/600x1200/indigo/white?text=Mobile+App+UI"
                        }}
                    />
                </motion.div>
            </div>
        </section>
    )
}
