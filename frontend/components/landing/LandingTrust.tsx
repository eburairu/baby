"use client"

import { Lock, ShieldCheck, Users, Shield } from "lucide-react"

const TRUST_ITEMS = [
    { icon: ShieldCheck, label: "SSLで通信を暗号化", bgColor: "bg-emerald-50 dark:bg-emerald-950/20", iconColor: "text-emerald-600 dark:text-emerald-400" },
    { icon: Users, label: "招待制のプライベート空間", bgColor: "bg-indigo-50 dark:bg-indigo-950/20", iconColor: "text-indigo-600 dark:text-indigo-400" },
    { icon: Shield, label: "ロールベースのアクセス管理", bgColor: "bg-blue-50 dark:bg-blue-950/20", iconColor: "text-blue-600 dark:text-blue-400" },
]

export function LandingTrust() {
    return (
        <section className="px-4 py-24 bg-white dark:bg-zinc-950 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-24">
                {/* セキュリティ・信頼性 */}
                <div className="text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                        <Lock className="h-4 w-4" />
                        家族だけのプライベートな空間
                    </div>
                    <h2 className="text-3xl font-bold">安心・安全なデータ管理</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        招待コードを知っている家族メンバーだけがアクセス可能。
                        赤ちゃんの成長記録は厳重に保護され、いつでも家族全員で振り返ることができます。
                        私たちは、あなたのプライバシーと赤ちゃんのデータを守ることを第一に考えています。
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        {TRUST_ITEMS.map((item) => {
                            const Icon = item.icon
                            return (
                                <div key={item.label} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm dark:shadow-none border border-slate-100 dark:border-zinc-800">
                                    <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                                        <Icon className={`h-5 w-5 ${item.iconColor}`} />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-200 text-center">{item.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* 開発者の想い (E-E-A-T) */}
                <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-3xl p-8 md:p-12 border border-slate-100 dark:border-zinc-800">
                    <div className="grid md:grid-cols-[200px_1fr] gap-8 md:gap-12 items-start">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm">
                                <Users className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-slate-800 dark:text-slate-200">Botoro 開発チーム</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">一児のパパ兼エンジニア</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 italic">「あれ、さっきいつミルクあげた？」をなくしたくて。</h3>
                            <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                                <p>
                                    きっかけは、私自身の育児経験でした。初めての子どもを迎え、毎日が幸せである一方で、驚くほど忙しく、睡眠不足の日々が続きました。
                                    「さっきおむつ替えたのはどっち？」「前回のミルクから何時間経った？」そんな何気ない確認の積み重ねが、疲れ切った夫婦の負担になっていることに気づきました。
                                </p>
                                <p>
                                    世の中には多くの育児アプリがありますが、私たちが求めていたのは「究極にシンプルで、リアルタイムに家族と繋がれる場所」でした。
                                    赤ちゃんを抱っこしながら片手で操作でき、パートナーが今何をしているか一瞬でわかる。そして、時にはお互いを「お疲れ様」と労い合える。
                                </p>
                                <p>
                                    そんな想いから生まれたのが、この「Botoro（ボトロ）」です。
                                    私たちは、最新のテクノロジーを活用しながらも、人の温かみを感じられるようなサービスを目指しています。
                                    Botoroが、あなたの育児ライフを少しでも軽やかに、そして家族の絆をより深める手助けになれば幸いです。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
