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
            <div className="max-w-3xl mx-auto text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                    <Lock className="h-4 w-4" />
                    家族だけのプライベートな空間
                </div>
                <h2 className="text-3xl font-bold">安心・安全なデータ管理</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    招待コードを知っている家族メンバーだけがアクセス可能。
                    赤ちゃんの成長記録は厳重に保護され、いつでも家族全員で振り返ることができます。
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
        </section>
    )
}
