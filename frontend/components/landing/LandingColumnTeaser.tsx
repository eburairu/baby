"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Clock } from "lucide-react"
import { ARTICLES, CATEGORY_COLORS } from "@/lib/column-data"

const FEATURED = ARTICLES.slice(0, 3)

export function LandingColumnTeaser() {
    return (
        <section className="px-4 py-24 bg-slate-50 dark:bg-zinc-900/50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">育児コラム</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        授乳・睡眠・おむつ・成長記録。毎日の育児に役立つ情報をお届けします。
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {FEATURED.map((article, i) => {
                        const colorClass = CATEGORY_COLORS[article.category] ?? "bg-slate-100 text-slate-600"
                        return (
                            <motion.div
                                key={article.slug}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    href={`/column/${article.slug}`}
                                    className="group flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md dark:hover:bg-zinc-800 transition-all"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
                                            {article.category}
                                        </span>
                                        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {article.readingTime}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug flex-1">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                                        {article.description}
                                    </p>
                                    <div className="mt-4 flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                        記事を読む
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>

                <div className="text-center">
                    <Link
                        href="/column"
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-sm"
                    >
                        コラムをすべて見る
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
