import Link from "next/link"
import type { Metadata } from "next"
import { ARTICLES } from "@/lib/column-data"
import { Clock, ChevronRight } from "lucide-react"

export const metadata: Metadata = {
    title: "育児コラム - Botoro",
    description: "授乳・睡眠・おむつ・成長記録など、育児に役立つ情報をまとめたコラム集。記録と共有で育児がもっと楽になるヒントをお届けします。",
}

const CATEGORY_COLORS: Record<string, string> = {
    "授乳・ミルク": "bg-rose-50 text-rose-600",
    "睡眠": "bg-indigo-50 text-indigo-600",
    "おむつ・健康": "bg-amber-50 text-amber-600",
    "夫婦・家族": "bg-emerald-50 text-emerald-600",
    "成長記録": "bg-blue-50 text-blue-600",
}

export default function ColumnIndexPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
                <div className="space-y-3">
                    <Link
                        href="/"
                        className="text-sm text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                    >
                        ← トップページに戻る
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">育児コラム</h1>
                    <p className="text-slate-600 leading-relaxed">
                        授乳・睡眠・おむつ・成長記録など、毎日の育児に役立つ情報をお届けします。
                        記録と家族間の共有がどのように育児を楽にするか、具体的なヒントとともに紹介します。
                    </p>
                </div>

                <div className="grid gap-6">
                    {ARTICLES.map((article) => {
                        const colorClass = CATEGORY_COLORS[article.category] ?? "bg-slate-100 text-slate-600"
                        return (
                            <Link
                                key={article.slug}
                                href={`/column/${article.slug}`}
                                className="group block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
                                                {article.category}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {article.readingTime}
                                            </span>
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                                            {article.title}
                                        </h2>
                                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                                            {article.description}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-1 hidden sm:block" />
                                </div>
                            </Link>
                        )
                    })}
                </div>

                <div className="bg-indigo-50 rounded-2xl p-6 text-center space-y-4 border border-indigo-100">
                    <p className="font-bold text-slate-800">育児記録をアプリで管理してみませんか？</p>
                    <p className="text-sm text-slate-600">授乳・睡眠・おむつ・成長を記録して家族と共有。Botoroは完全無料です。</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors text-sm"
                    >
                        無料で始める
                    </Link>
                </div>
            </div>
        </div>
    )
}
