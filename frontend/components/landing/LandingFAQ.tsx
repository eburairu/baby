"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const FAQ_ITEMS = [
    {
        question: "利用料金はかかりますか？",
        answer: "完全無料でご利用いただけます。クレジットカードの登録も不要です。",
    },
    {
        question: "何人まで家族を招待できますか？",
        answer: "複数名を招待できます。パートナー、祖父母など家族全員でご利用ください。",
    },
    {
        question: "iPhoneやAndroidでも使えますか？",
        answer: "はい。モバイルブラウザから利用できるPWA（プログレッシブウェブアプリ）に対応しています。ホーム画面に追加するとアプリのように使えます。",
    },
    {
        question: "データは安全に管理されますか？",
        answer: "招待コードを知っている家族だけがアクセスできる招待制を採用しています。通信はSSL暗号化され、パスワードはハッシュ化して保管します。",
    },
    {
        question: "AIサマリーは有料機能ですか？",
        answer: "いいえ。AIによる育児サマリー機能も含めてすべて無料でご利用いただけます。",
    },
    {
        question: "複数の赤ちゃんを登録できますか？",
        answer: "はい。きょうだいがいるご家庭でも、複数の赤ちゃんを登録して別々に記録を管理できます。",
    },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
            >
                <span className="font-bold text-slate-800">{question}</span>
                {open ? (
                    <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                )}
            </button>
            {open && (
                <div className="px-6 pb-6 text-slate-600 leading-relaxed text-sm border-t border-slate-100 pt-4">
                    {answer}
                </div>
            )}
        </div>
    )
}

export function LandingFAQ() {
    return (
        <section id="faq" className="px-4 py-24 bg-slate-50">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">よくある質問</h2>
                    <p className="text-slate-500">ご不明な点はこちらをご覧ください。</p>
                </div>
                <div className="space-y-4">
                    {FAQ_ITEMS.map((item, i) => (
                        <FaqItem key={i} question={item.question} answer={item.answer} />
                    ))}
                </div>
            </div>
        </section>
    )
}
