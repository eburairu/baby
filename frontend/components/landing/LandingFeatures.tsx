"use client"

import { motion } from "framer-motion"
import { Baby, Smile, MessageSquare, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const FEATURES = [
    {
        title: "リアルタイム共有",
        bullets: [
            "入力したらパートナーに即通知",
            "すれ違いの不安をゼロに",
            "離れていても成長を実感できる",
        ],
        icon: <Baby className="h-6 w-6 text-rose-500 dark:text-rose-400" />,
        color: "bg-rose-50 dark:bg-rose-950/30"
    },
    {
        title: "AI サマリー",
        bullets: [
            "1日のリズムを自動分析",
            "不安に寄り添う温かいアドバイス",
            "寝かしつけのタイミングがわかる",
        ],
        icon: <MessageSquare className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />,
        color: "bg-indigo-50 dark:bg-indigo-950/30"
    },
    {
        title: "シンプル操作",
        bullets: [
            "赤ちゃんを抱っこしながら片手で完了",
            "迷わない直感的なデザイン",
            "忙しい時でもサッと記録できる",
        ],
        icon: <Smile className="h-6 w-6 text-amber-500 dark:text-amber-400" />,
        color: "bg-amber-50 dark:bg-amber-950/30"
    }
]

export function LandingFeatures() {
    return (
        <section id="features" className="px-4 py-24 bg-white dark:bg-zinc-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">3つの特徴</h2>
                    <p className="text-slate-500 dark:text-slate-400">毎日の育児をもっと楽しく、もっと楽に。</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {FEATURES.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                        >
                            <Card className="border-0 dark:border dark:border-zinc-800 shadow-lg shadow-slate-100 dark:shadow-none bg-white dark:bg-zinc-900/50 h-full">
                                <CardContent className="p-8 text-center flex flex-col items-center h-full">
                                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{feature.title}</h3>

                                    <ul className="text-left space-y-3 mt-2 w-full">
                                        {feature.bullets.map((bullet, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">
                                                    {bullet}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
