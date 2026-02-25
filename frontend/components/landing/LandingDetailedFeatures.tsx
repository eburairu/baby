"use client"

import { motion } from "framer-motion"
import { Baby, Moon, Droplets, TrendingUp, MessageCircle, Bell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const DETAILED_FEATURES = [
    { label: "授乳・ミルク記録", icon: Baby, bgColor: "bg-rose-50", iconColor: "text-rose-500" },
    { label: "睡眠記録", icon: Moon, bgColor: "bg-indigo-50", iconColor: "text-indigo-500" },
    { label: "おむつ・健康状態", icon: Droplets, bgColor: "bg-amber-50", iconColor: "text-amber-500" },
    { label: "成長グラフ", icon: TrendingUp, bgColor: "bg-emerald-50", iconColor: "text-emerald-500" },
    { label: "応援コメント機能", icon: MessageCircle, bgColor: "bg-blue-50", iconColor: "text-blue-500" },
    { label: "プッシュ通知", icon: Bell, bgColor: "bg-purple-50", iconColor: "text-purple-500" },
]

export function LandingDetailedFeatures() {
    return (
        <section id="details" className="px-4 py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">充実の機能</h2>
                    <p className="text-slate-500">必要な機能はすべて揃っています。</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {DETAILED_FEATURES.map((feature, i) => {
                        const Icon = feature.icon
                        return (
                            <motion.div
                                key={feature.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow text-center h-full">
                                    <CardContent className="p-6 space-y-3 flex flex-col items-center justify-center h-full">
                                        <div className={`w-12 h-12 rounded-2xl ${feature.bgColor} flex items-center justify-center`}>
                                            <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                                        </div>
                                        <span className="font-bold text-sm text-slate-700">{feature.label}</span>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
