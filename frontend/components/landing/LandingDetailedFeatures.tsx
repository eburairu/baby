"use client"

import { motion } from "framer-motion"
import { Baby, Moon, Droplets, TrendingUp, MessageCircle, Bell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const DETAILED_FEATURES = [
    { 
        label: "授乳・ミルク記録", 
        description: "左右の授乳時間やミルクの量を1タップで記録。前回からの経過時間も一目でわかるので、次のタイミングに迷いません。夜泣きで頭が回らない時でも、記録があれば安心です。",
        icon: Baby, 
        bgColor: "bg-rose-50 dark:bg-rose-950/20", 
        iconColor: "text-rose-500 dark:text-rose-400" 
    },
    { 
        label: "睡眠記録", 
        description: "「いつ寝て、いつ起きたか」を記録し、1日の合計睡眠時間を自動計算。赤ちゃんの睡眠リズムを可視化することで、寝かしつけのタイミングや生活リズムの改善に役立てることができます。",
        icon: Moon, 
        bgColor: "bg-indigo-50 dark:bg-indigo-950/20", 
        iconColor: "text-indigo-500 dark:text-indigo-400" 
    },
    { 
        label: "おむつ・健康状態", 
        description: "おしっこ・うんちの回数や、体温、機嫌などを細かく記録。日々の小さな変化をログとして残すことで、体調を崩した際や健診時に、医師へ正確な情報を伝えることができます。",
        icon: Droplets, 
        bgColor: "bg-amber-50 dark:bg-amber-950/20", 
        iconColor: "text-amber-500 dark:text-amber-400" 
    },
    { 
        label: "成長グラフ", 
        description: "身長・体重を入力すると、厚生労働省の成長曲線に合わせたグラフを自動生成。標準的な成長の目安と比較しながら、わが子の健やかな成長を視覚的に実感することができます。",
        icon: TrendingUp, 
        bgColor: "bg-emerald-50 dark:bg-emerald-950/20", 
        iconColor: "text-emerald-500 dark:text-emerald-400" 
    },
    { 
        label: "応援コメント機能", 
        description: "パートナーの記録に対して、「お疲れ様」「ありがとう」といったコメントやスタンプを。一人で抱え込みがちな育児の時間も、家族がチームとなって支え合える仕組みです。",
        icon: MessageCircle, 
        bgColor: "bg-blue-50 dark:bg-blue-950/20", 
        iconColor: "text-blue-500 dark:text-blue-400" 
    },
    { 
        label: "プッシュ通知", 
        description: "パートナーが記録を付けた瞬間にリアルタイムで通知。仕事中の休憩時間や外出先でも、赤ちゃんの今の様子を把握できるため、離れていても家族の絆を感じられます。",
        icon: Bell, 
        bgColor: "bg-purple-50 dark:bg-purple-950/20", 
        iconColor: "text-purple-500 dark:text-purple-400" 
    },
]

export function LandingDetailedFeatures() {
    return (
        <section id="details" className="px-4 py-24 bg-slate-50 dark:bg-zinc-900/50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">育児を支える充実の機能</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Botoroは、毎日の忙しい育児の中で「本当に必要なこと」をシンプルに、かつ詳細に記録できる機能を取り揃えています。
                        単なる記録ツールではなく、家族のコミュニケーションを円滑にし、不安を解消するための工夫が詰まっています。
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {DETAILED_FEATURES.map((feature, i) => {
                        const Icon = feature.icon
                        return (
                            <motion.div
                                key={feature.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="border-0 dark:border dark:border-zinc-800 shadow-sm hover:shadow-md dark:shadow-none transition-all h-full bg-white dark:bg-zinc-900 group">
                                    <CardContent className="p-8 space-y-4">
                                        <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{feature.label}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
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
