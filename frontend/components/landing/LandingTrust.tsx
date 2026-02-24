"use client"

export function LandingTrust() {
    return (
        <section className="px-4 py-24 bg-white">
            <div className="max-w-3xl mx-auto text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold">
                    🔒 家族だけのプライベートな空間
                </div>
                <h2 className="text-3xl font-bold">安心・安全なデータ管理</h2>
                <p className="text-slate-600 leading-relaxed">
                    招待コードを知っている家族メンバーだけがアクセス可能。
                    赤ちゃんの成長記録は厳重に保護され、いつでも家族全員で振り返ることができます。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    {[
                        { icon: "🔐", label: "SSLで通信を暗号化" },
                        { icon: "👨‍👩‍👧", label: "招待制のプライベート空間" },
                        { icon: "🛡️", label: "ロールベースのアクセス管理" },
                    ].map((item) => (
                        <div key={item.label} className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-medium text-slate-700 text-center">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
