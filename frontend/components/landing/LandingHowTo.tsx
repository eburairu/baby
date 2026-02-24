"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const HOW_TO_STEPS = [
    {
        step: "01",
        title: "アカウントを作成",
        description: "メールアドレスだけで簡単登録。クレジットカードは不要、完全無料で始められます。",
        icon: "📝",
    },
    {
        step: "02",
        title: "家族を招待",
        description: "発行された招待コードをパートナーや祖父母に共有。家族全員でつながりましょう。",
        icon: "👨‍👩‍👧",
    },
    {
        step: "03",
        title: "一緒に記録・共有",
        description: "授乳、睡眠、おむつをリアルタイムで記録。全員がいつでも最新状態を確認できます。",
        icon: "📱",
    },
]

interface LandingHowToProps {
    isLoggedIn?: boolean
}

export function LandingHowTo({ isLoggedIn = false }: LandingHowToProps) {
    return (
        <section id="howto" className="px-4 py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">3ステップで始められる</h2>
                    <p className="text-slate-500">難しい設定は不要。すぐに家族と育児を共有できます。</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {HOW_TO_STEPS.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            className="relative text-center space-y-4"
                        >
                            <div className="relative mx-auto w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-4xl">
                                {step.icon}
                                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                                    {step.step}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold">{step.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
                {!isLoggedIn && (
                    <div className="text-center">
                        <Link href="/register">
                            <Button className="h-14 px-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-105">
                                今すぐ無料で始める
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}
