"use client"

import { motion } from "framer-motion"
import { Baby, Smile, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const FEATURES = [
    {
        title: "リアルタイム共有",
        description: "パパが記録、ママが確認。職場からでも赤ちゃんの様子がわかります。家族全員で成長を見守りましょう。",
        icon: <Baby className="h-6 w-6 text-rose-500" />,
        color: "bg-rose-50"
    },
    {
        title: "AI サマリー",
        description: "毎日の記録をAIが分析。授乳リズムや睡眠パターンを要約してアドバイス。育児の「コツ」が見えてきます。",
        icon: <MessageSquare className="h-6 w-6 text-indigo-500" />,
        color: "bg-indigo-50"
    },
    {
        title: "シンプル操作",
        description: "授乳タイマーやおむつ記録など、片手で操作できるUI。忙しい育児の合間でもストレスなく記録できます。",
        icon: <Smile className="h-6 w-6 text-amber-500" />,
        color: "bg-amber-50"
    }
]

export function LandingFeatures() {
    return (
        <section id="features" className="px-4 py-24 bg-white">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">3つの特徴</h2>
                    <p className="text-slate-500">毎日の育児をもっと楽しく、もっと楽に。</p>
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
                            <Card className="border-0 shadow-lg shadow-slate-100 h-full">
                                <CardContent className="p-8 space-y-4 text-center">
                                    <div className={`mx-auto w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold">{feature.title}</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">
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
