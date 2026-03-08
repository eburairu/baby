import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ARTICLES, getArticle } from "@/lib/column-data"
import { Clock, ChevronRight, Lightbulb } from "lucide-react"

type Props = {
    params: Promise<{ slug: string }>
}

export function generateStaticParams() {
    return ARTICLES.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const article = getArticle(slug)
    if (!article) return {}
    return {
        title: `${article.title} - Botoro育児コラム`,
        description: article.description,
    }
}

const CATEGORY_COLORS: Record<string, string> = {
    "授乳・ミルク": "bg-rose-50 text-rose-600",
    "睡眠": "bg-indigo-50 text-indigo-600",
    "おむつ・健康": "bg-amber-50 text-amber-600",
    "夫婦・家族": "bg-emerald-50 text-emerald-600",
    "成長記録": "bg-blue-50 text-blue-600",
}

export default async function ColumnArticlePage({ params }: Props) {
    const { slug } = await params
    const article = getArticle(slug)
    if (!article) notFound()

    const colorClass = CATEGORY_COLORS[article.category] ?? "bg-slate-100 text-slate-600"
    const otherArticles = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3)

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
                {/* パンくず */}
                <nav className="flex items-center gap-1 text-sm text-slate-400">
                    <Link href="/" className="hover:text-indigo-600 transition-colors">トップ</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/column" className="hover:text-indigo-600 transition-colors">育児コラム</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-600 line-clamp-1">{article.title}</span>
                </nav>

                {/* ヘッダー */}
                <header className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colorClass}`}>
                            {article.category}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readingTime}
                        </span>
                        <span className="text-xs text-slate-400">{article.publishedAt}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
                        {article.title}
                    </h1>
                </header>

                {/* リード文 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <p className="text-slate-600 leading-relaxed">{article.lead}</p>
                </div>

                {/* 本文 */}
                <article className="space-y-10">
                    {article.sections.map((section, i) => (
                        <section key={i} className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 border-l-4 border-indigo-500 pl-4">
                                {section.heading}
                            </h2>
                            <div className="space-y-3">
                                {section.body.map((para, j) => (
                                    <p key={j} className="text-slate-600 leading-relaxed">
                                        {para}
                                    </p>
                                ))}
                            </div>
                            {section.appTip && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-2">
                                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                                        <Lightbulb className="w-4 h-4" />
                                        {section.appTip.title}
                                    </div>
                                    <p className="text-indigo-800 text-sm leading-relaxed">
                                        {section.appTip.body}
                                    </p>
                                </div>
                            )}
                        </section>
                    ))}

                    {/* まとめ */}
                    <section className="bg-slate-800 text-white rounded-2xl p-6 space-y-3">
                        <h2 className="text-lg font-bold">まとめ</h2>
                        <p className="text-slate-200 leading-relaxed text-sm">{article.conclusion}</p>
                    </section>
                </article>

                {/* CTA */}
                <div className="bg-indigo-600 rounded-2xl p-6 text-center space-y-3 text-white">
                    <p className="font-bold text-lg">Botoroで育児記録を始める</p>
                    <p className="text-indigo-100 text-sm">授乳・睡眠・おむつ・成長を記録して家族と共有。完全無料・登録1分。</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors text-sm"
                    >
                        無料で始める
                    </Link>
                </div>

                {/* 関連記事 */}
                {otherArticles.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">他のコラムを読む</h2>
                        <div className="grid gap-4">
                            {otherArticles.map((a) => {
                                const c = CATEGORY_COLORS[a.category] ?? "bg-slate-100 text-slate-600"
                                return (
                                    <Link
                                        key={a.slug}
                                        href={`/column/${a.slug}`}
                                        className="group flex items-center gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex-1 space-y-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c}`}>
                                                {a.category}
                                            </span>
                                            <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors leading-snug">
                                                {a.title}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
