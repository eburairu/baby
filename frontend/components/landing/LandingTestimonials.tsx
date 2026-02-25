"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const TESTIMONIALS = [
    {
        name: "Y.S さん (3ヶ月のママ)",
        comment: "授乳のタイミングを忘れがちでしたが、このアプリのおかげでリズムが掴めるようになりました。夫も積極的に記録してくれて助かっています！",
        rating: 5,
    },
    {
        name: "K.T さん (6ヶ月のパパ)",
        comment: "仕事中に通知が来るのが楽しみです。「あ、今ミルク飲んだんだな」と分かるだけで安心できます。シンプルなデザインで使いやすいです。",
        rating: 5,
    },
    {
        name: "M.I さん (1歳のママ)",
        comment: "夜泣きのパターンが可視化されて、寝かしつけの対策が立てやすくなりました。AIのアドバイスも意外と的確で参考になります。",
        rating: 4,
    },
]

export function LandingTestimonials() {
    return (
        <section className="px-4 py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">ユーザーの声</h2>
                    <p className="text-slate-500">たくさんのパパ・ママに利用されています。</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                        >
                            <Card className="h-full rounded-2xl border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, j) => (
                                            <Star
                                                key={j}
                                                className={`h-4 w-4 ${j < item.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 leading-relaxed text-sm italic">
                                        &quot;{item.comment}&quot;
                                    </p>
                                    <div className="pt-4 border-t border-slate-100">
                                        <p className="font-bold text-sm text-slate-800">{item.name}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
