import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4">
            <div className="max-w-3xl mx-auto space-y-12">
                <Link href="/">
                    <Button variant="ghost" className="gap-2 text-slate-600">
                        <ArrowLeft className="h-4 w-4" />
                        トップページに戻る
                    </Button>
                </Link>
                
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm space-y-8 text-slate-900">
                    <h1 className="text-3xl font-bold tracking-tight">プライバシーポリシー</h1>
                    
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">1. 収集する情報</h2>
                        <p className="text-slate-600 leading-relaxed">
                            当アプリでは、赤ちゃんの育児記録（授乳、睡眠、おむつ、成長記録等）および、
                            家族アカウント作成のためのメールアドレス、プロフィール情報を収集します。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">2. 利用目的</h2>
                        <p className="text-slate-600 leading-relaxed">
                            収集した情報は、以下の目的で利用します：
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li>家族間での育児情報の共有</li>
                            <li>AIによる育児アドバイスの生成</li>
                            <li>サービス改善および新機能の開発</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">3. データの管理</h2>
                        <p className="text-slate-600 leading-relaxed">
                            お客様のデータは厳重に管理され、招待された家族メンバー以外に公開されることはありません。
                        </p>
                    </section>

                    <footer className="pt-8 border-t border-slate-100 text-sm text-slate-400">
                        最終更新日: 2026年2月21日
                    </footer>
                </div>
            </div>
        </div>
    )
}
