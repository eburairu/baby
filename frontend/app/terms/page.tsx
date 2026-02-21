import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
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
                    <h1 className="text-3xl font-bold tracking-tight">利用規約</h1>
                    
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">1. サービスの利用</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本アプリは、家族間での育児情報の共有を目的として提供されます。
                            利用者は、自らの責任において本サービスを利用するものとします。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">2. アカウント管理</h2>
                        <p className="text-slate-600 leading-relaxed">
                            利用者は、自らのログイン情報を厳重に管理するものとします。
                            家族メンバー以外への不用意な招待コードの公開は控えてください。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">3. 禁止事項</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li>法令または公序良俗に反する行為</li>
                            <li>本サービスの運営を妨害する行為</li>
                            <li>他者の個人情報を不正に収集・利用する行為</li>
                        </ul>
                    </section>

                    <footer className="pt-8 border-t border-slate-100 text-sm text-slate-400">
                        最終更新日: 2026年2月21日
                    </footer>
                </div>
            </div>
        </div>
    )
}
