import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Shield, Zap, Users } from "lucide-react"
import type { Metadata } from "next"
import { StaticPageLayout } from "@/components/ui/static-page-layout"

export const metadata: Metadata = {
    title: "Botoro について",
    description: "Botoroは、育児をもっと楽しく・家族で共有できるようにするために作られた育児記録アプリです。開発の想いとサービス情報をご紹介します。",
}

export default function AboutPage() {
    return (
        <StaticPageLayout>
            <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Botoro について</h1>
                        <p className="text-indigo-600 font-medium">家族の育児を、もっとつながりのある時間に。</p>
                    </div>

                    {/* コンセプト紹介 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">サービスの想い</h2>
                        <p className="text-slate-600 leading-relaxed">
                            赤ちゃんが生まれると、育児は24時間365日の連続した仕事になります。授乳のタイミング、最後のおむつ交換から何時間が経ったか、今日はどれだけ眠れたか——これらを一人で把握し続けることは、とても大変なことです。
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Botoroは、「育児を一人で抱え込まず、家族全員で分かち合える」ようにするために作られました。
                            パパが記録すれば、ママが確認できる。おじいちゃん・おばあちゃんも一緒に成長を見守れる。そんな「つながりのある育児」を実現するのが、Botoroのミッションです。
                        </p>
                    </section>

                    {/* 特徴 */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">Botoro の特徴</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                                    <Users className="h-5 w-5 text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-1">招待制のプライバシー保護</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">招待コードを知っている家族だけがアクセス可能。大切な育児記録を安全に守ります。</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Zap className="h-5 w-5 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-1">片手で操作できるUI</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">赤ちゃんを抱っこしながらでも、片手でサッと記録できるシンプルな設計です。</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                    <Shield className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-1">AIによる育児サポート</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">毎日の記録をAIが分析し、授乳リズムや睡眠パターンをわかりやすくサマリー。</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                    <Heart className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-1">役割に応じたアクセス管理</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">管理者・メンバー・閲覧者の3段階ロールで、祖父母など遠くの家族も安心して招待できます。</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 機能一覧 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">主な機能</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: "🤱", label: "授乳・ミルク記録" },
                                { icon: "💤", label: "睡眠記録" },
                                { icon: "💩", label: "おむつ・健康記録" },
                                { icon: "📈", label: "成長グラフ（体重・身長）" },
                                { icon: "🤖", label: "AIによる育児サマリー" },
                                { icon: "💬", label: "家族への応援コメント" },
                                { icon: "🔔", label: "プッシュ通知" },
                                { icon: "👨‍👩‍👧", label: "複数メンバー招待" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                                    <span className="text-2xl">{item.icon}</span>
                                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* サービス情報 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">サービス情報</h2>
                        <div className="space-y-3 text-slate-600">
                            <div className="flex flex-col sm:flex-row sm:gap-4">
                                <span className="font-medium text-slate-800 w-32 shrink-0">サービス名</span>
                                <span>Botoro</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:gap-4">
                                <span className="font-medium text-slate-800 w-32 shrink-0">運営者</span>
                                <span>Botoro 運営者</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:gap-4">
                                <span className="font-medium text-slate-800 w-32 shrink-0">サービス開始</span>
                                <span>2026年</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:gap-4">
                                <span className="font-medium text-slate-800 w-32 shrink-0">対応環境</span>
                                <span>モダンブラウザ（Chrome, Safari, Firefox）/ iOS・Android（PWA対応）</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:gap-4">
                                <span className="font-medium text-slate-800 w-32 shrink-0">利用料金</span>
                                <span>完全無料（クレジットカード登録不要）</span>
                            </div>
                        </div>
                    </section>

            {/* CTA */}
            <div className="bg-indigo-50 rounded-2xl p-6 text-center space-y-4">
                <p className="font-bold text-slate-800">Botoroを使ってみませんか？</p>
                <p className="text-slate-600 text-sm">今すぐ無料でアカウントを作成できます。</p>
                <Link href="/register">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8">
                        無料で始める
                    </Button>
                </Link>
            </div>
        </StaticPageLayout>
    )
}
