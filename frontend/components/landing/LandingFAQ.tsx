"use client"

import { useState, useId } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const FAQ_ITEMS = [
    {
        question: "利用料金は本当にかかりませんか？",
        answer: "はい、完全無料でご利用いただけます。会員登録、すべての記録機能、家族招待、AIサマリー機能に至るまで、追加料金が発生することは一切ありません。また、クレジットカード情報の登録も不要ですので、安心して育児にお役立てください。",
    },
    {
        question: "何人まで家族を招待できますか？",
        answer: "招待人数に制限はありません。パパ・ママだけでなく、おじいちゃん、おばあちゃん、あるいはシッターさんなど、育児に関わる家族全員で同じ赤ちゃんの記録をリアルタイムに共有できます。",
    },
    {
        question: "iPhoneやAndroidのアプリはありますか？",
        answer: "ネイティブアプリの代わりに、Webブラウザから利用できるPWA（プログレッシブウェブアプリ）に対応しています。iPhoneのSafariやAndroidのChromeで「ホーム画面に追加」を行うことで、通常のアプリと同じようにアイコンから素早く起動し、全画面で快適にご利用いただけます。",
    },
    {
        question: "データはどのように保護されていますか？",
        answer: "Botoroはセキュリティを最優先に設計されています。通信はすべてSSLで暗号化され、第三者による盗聴を防ぎます。また、記録へのアクセスは招待コードを受け取った承認済みの家族メンバーに限定されており、プライベートな育児記録が外部に漏れることはありません。",
    },
    {
        question: "機種変更をした場合、データは引き継げますか？",
        answer: "はい、可能です。データはクラウド上の安全なサーバーに保存されているため、新しい端末で同じアカウント（メールアドレス）でログインするだけで、これまでの記録をすべてそのまま閲覧・更新いただけます。",
    },
    {
        question: "AIサマリーとはどのような機能ですか？",
        answer: "日々の授乳や睡眠の記録をAIが分析し、「今日はいつもより寝る時間が長めですね」「授乳の間隔が安定してきました」といったフィードバックを生成する機能です。忙しい毎日の変化を客観的に振り返るきっかけとしてご活用いただけます。",
    },
    {
        question: "複数の赤ちゃんを個別に管理できますか？",
        answer: "はい、対応しています。双子のお子様や、年の近いごきょうだいがいる場合でも、赤ちゃんごとに個別のプロフィールを作成し、記録を完全に分けて管理することが可能です。",
    },
    {
        question: "通知が多すぎたりしませんか？",
        answer: "パートナーが記録した際の通知は、必要に応じてオン・オフを切り替えることができます。また、特定の項目（例：授乳だけ通知する）といった設定も可能なため、ご自身のライフスタイルに合わせて調整いただけます。",
    },
    {
        question: "夜間モードやダークモードには対応していますか？",
        answer: "はい、対応しています。OSの設定に合わせた自動切り替えはもちろん、夜間の授乳中に画面が眩しくないよう、目に優しいダークテーマを標準搭載しています。",
    },
    {
        question: "退会したい場合、データはどうなりますか？",
        answer: "退会手続きを行っていただくと、登録されたアカウント情報および赤ちゃんの記録データはサーバーから速やかに、かつ完全に削除されます。プライバシー保護の観点から、不要になったデータが残ることはありません。",
    },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false)
    const uniqueId = useId()
    const id = `faq-${uniqueId}`

    return (
        <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/50 transition-colors">
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls={id}
                className="w-full flex items-center justify-between p-6 rounded-2xl text-left hover:bg-slate-50 dark:hover:bg-zinc-800 active:bg-slate-100 dark:active:bg-zinc-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
            >
                <span className="font-bold text-slate-800 dark:text-slate-200">{question}</span>
                {open ? (
                    <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                )}
            </button>
            <div
                id={id}
                hidden={!open}
                className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm border-t border-slate-100 dark:border-zinc-800 pt-4"
            >
                {answer}
            </div>
        </div>
    )
}

export function LandingFAQ() {
    return (
        <section id="faq" className="px-4 py-24 bg-slate-50 dark:bg-zinc-900/50 transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">よくある質問</h2>
                    <p className="text-slate-500 dark:text-slate-400">ご不明な点はこちらをご覧ください。</p>
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
