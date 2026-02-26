"use client"

import { motion } from "framer-motion"
import { Baby, Smile, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const FEATURES = [
    {
        title: "リアルタイム共有",
        description: "パパが記録、ママが確認。職場からでも赤ちゃんの様子がわかります。家族全員で成長を見守りましょう。",
        icon: <Baby className="h-6 w-6 text-rose-500 dark:text-rose-400" />,
        color: "bg-rose-50 dark:bg-rose-950/30"
    },
    {
        title: "AI サマリー",
        description: "毎日の記録をAIが分析。授乳リズムや睡眠パターンを要約してアドバイス。育児の「コツ」が見えてきます。",
        icon: <MessageSquare className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />,
        color: "bg-indigo-50 dark:bg-indigo-950/30"
    },
    {
        title: "シンプル操作",
        description: "授乳タイマーやおむつ記録など、片手で操作できるUI。忙しい育児の合間でもストレスなく記録できます。",
        icon: <Smile className="h-6 w-6 text-amber-500 dark:text-amber-400" />,
        color: "bg-amber-50 dark:bg-amber-950/30"
    }
]

export function LandingFeatures() {
    return (
        <section id="features" className="px-4 py-24 bg-white dark:bg-zinc-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Botoroが選ばれる<span className="text-indigo-600">3つの理由</span></h2>
                    <p className="text-slate-500 dark:text-slate-400">ただの記録アプリではありません。家族の連携を深め、毎日の育児をサポートします。</p>
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
                                <CardContent className="p-8 space-y-4 text-center">
                                    <div className={`mx-auto w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold">{feature.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
