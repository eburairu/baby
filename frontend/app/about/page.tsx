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
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">サービスの想い</h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed">
                            <p>
                                赤ちゃんが生まれると、生活は一変します。授乳、おむつ、睡眠。これらを24時間休むことなく管理し続けることは、想像以上に孤独で大変な作業です。
                                特に初めての育児では、不安から「さっきおむつ替えたのいつだっけ？」「ミルクはどのくらい飲ませればいいの？」といった疑問が絶えません。
                            </p>
                            <p>
                                Botoroは、「育児を一人で抱え込まず、家族全員がワンチームとして分かち合える」場所を作るために生まれました。
                                パパが記録すればママに通知が届き、お互いに労い合える。遠くに住むおじいちゃん・おばあちゃんも、孫の成長をリアルタイムに感じることができる。
                                私たちが目指しているのは、単なる記録ツールではなく、家族の絆を深める「コミュニケーションの起点」となるアプリです。
                            </p>
                            <p>
                                また、Botoroは完全無料で提供されています。これは、経済的な負担を増やすことなく、すべての育児世帯が安心してテクノロジーの恩恵を受けられるようにしたいという、私たちの強い願いからきています。
                            </p>
                        </div>
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
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">運営者情報</h2>
                        <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-800">Botoro 開発・運営プロジェクト</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    私たちBotoroプロジェクトは、自身も子育てに奮闘するパパ・ママエンジニア、デザイナーが集まって立ち上げた有志のチームです。
                                    「自分たちが本当に欲しかった育児アプリ」を形にするため、ユーザーの皆様の声を大切にしながら、日々機能の改善と運用を行っています。
                                </p>
                            </div>
                            <div className="space-y-3 text-slate-600 border-t border-slate-200 pt-4 text-sm">
                                <div className="flex flex-col sm:flex-row sm:gap-4">
                                    <span className="font-bold text-slate-800 w-32 shrink-0">サービス名</span>
                                    <span>Botoro (ボトロ)</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:gap-4">
                                    <span className="font-bold text-slate-800 w-32 shrink-0">主な活動拠点</span>
                                    <span>日本</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:gap-4">
                                    <span className="font-bold text-slate-800 w-32 shrink-0">開発・運営</span>
                                    <span>Botoro Project Team</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:gap-4">
                                    <span className="font-bold text-slate-800 w-32 shrink-0">お問い合わせ</span>
                                    <span>お問い合わせフォームより承っております</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:gap-4">
                                    <span className="font-bold text-slate-800 w-32 shrink-0">利用条件</span>
                                    <span>完全無料、広告表示あり、PWA対応</span>
                                </div>
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
