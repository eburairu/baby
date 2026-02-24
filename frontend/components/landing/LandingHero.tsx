"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Monitor, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface LandingHeroProps {
    isLoggedIn?: boolean
}

export function LandingHero({ isLoggedIn = false }: LandingHeroProps) {
    const [activeView, setActiveView] = useState<"desktop" | "mobile">("desktop")

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
                        「あれ、さっきいつあげた？」<br />
                        その確認、もう不要です。<br />
                        <span className="text-indigo-600">夫婦で共有する育児記録</span>で、<br className="hidden lg:block" />毎日の不安と手間をゼロに。
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
                                            無料で育児記録を始める
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <div className="text-xs font-bold mt-2 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-slate-500">
                                        <span>✨ 1分で簡単スタート ・ 夫婦で共有OK</span>
                                        <span className="hidden sm:inline text-slate-300">|</span>
                                        <span className="text-indigo-600">完全無料</span>
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
                    className="relative mx-auto lg:mx-0 flex flex-col items-center gap-4"
                >
                    {/* 切り替えタブ */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 border border-slate-200">
                        <button
                            onClick={() => setActiveView("desktop")}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                activeView === "desktop"
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <Monitor className="w-3.5 h-3.5" />
                            デスクトップ
                        </button>
                        <button
                            onClick={() => setActiveView("mobile")}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                activeView === "mobile"
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <Smartphone className="w-3.5 h-3.5" />
                            モバイル
                        </button>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-rose-50 rounded-3xl blur-3xl opacity-50 -z-10" />

                    {/* デスクトップモックアップ */}
                    {activeView === "desktop" && (
                        <motion.div
                            key="desktop"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25 }}
                            className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-white w-full"
                        >
                            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                <div className="flex-1 mx-3 py-1 px-3 rounded-md bg-white text-xs text-slate-400 text-center border border-slate-200">
                                    baby-app.example.com/dashboard
                                </div>
                            </div>
                            <img
                                src="/screenshots/dashboard.png"
                                alt="ダッシュボードのスクリーンショット（デスクトップ）"
                                className="w-full"
                            />
                        </motion.div>
                    )}

                    {/* モバイルモックアップ */}
                    {activeView === "mobile" && (
                        <motion.div
                            key="mobile"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25 }}
                            className="relative mx-auto"
                            style={{ width: 260 }}
                        >
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-slate-800 bg-slate-800">
                                {/* パンチホール */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-slate-800 rounded-full z-10" />
                                <img
                                    src="/screenshots/dashboard-mobile.png"
                                    alt="ダッシュボードのスクリーンショット（モバイル）"
                                    className="w-full"
                                />
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}
