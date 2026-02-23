"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Baby, Smile, MessageSquare, ChevronDown, ChevronUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useState } from "react"

const FEATURES = [
    {
        title: "リアルタイム共有",
        description: "パパが記録、ママが確認。職場からでも赤ちゃんの様子がわかります。家族全員で成長を見守りましょう。",
        icon: <Baby className="h-6 w-6 text-rose-500" />,
        color: "bg-rose-50"
    },
    {
        title: "AI サマリー",
        description: "毎日の記録をAIが分析。授乳リズムや睡眠パターンを要約してアドバイス。育児の「コツ」が見えてきます。",
        icon: <MessageSquare className="h-6 w-6 text-indigo-500" />,
        color: "bg-indigo-50"
    },
    {
        title: "シンプル操作",
        description: "授乳タイマーやおむつ記録など、片手で操作できるUI。忙しい育児の合間でもストレスなく記録できます。",
        icon: <Smile className="h-6 w-6 text-amber-500" />,
        color: "bg-amber-50"
    }
]

const DETAILED_FEATURES = [
    { label: "授乳・ミルク記録", icon: "🤱", color: "text-rose-500" },
    { label: "睡眠記録", icon: "💤", color: "text-indigo-500" },
    { label: "おむつ・健康状態", icon: "💩", color: "text-amber-500" },
    { label: "成長グラフ", icon: "📈", color: "text-emerald-500" },
    { label: "応援コメント機能", icon: "💬", color: "text-blue-500" },
    { label: "プッシュ通知", icon: "🔔", color: "text-purple-500" }
]

const HOW_TO_STEPS = [
    {
        step: "01",
        title: "アカウントを作成",
        description: "メールアドレスだけで簡単登録。クレジットカードは不要、完全無料で始められます。",
        icon: "📝",
    },
    {
        step: "02",
        title: "家族を招待",
        description: "発行された招待コードをパートナーや祖父母に共有。家族全員でつながりましょう。",
        icon: "👨‍👩‍👧",
    },
    {
        step: "03",
        title: "一緒に記録・共有",
        description: "授乳、睡眠、おむつをリアルタイムで記録。全員がいつでも最新状態を確認できます。",
        icon: "📱",
    },
]

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

export function LandingContent({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-indigo-600">Baby App</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">特徴</a>
                        <a href="#details" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">機能</a>
                        <a href="#howto" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">使い方</a>
                        <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">よくある質問</a>
                    </nav>
                    <div>
                        {isLoggedIn ? (
                            <Link href="/dashboard">
                                <Button variant="ghost" className="text-sm font-medium text-indigo-600">ダッシュボード</Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button variant="ghost" className="text-sm font-medium text-slate-600">ログイン</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-16">
                {/* Hero Section */}
                <section className="relative px-4 py-12 lg:py-32 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center lg:text-left space-y-8"
                        >
                            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                                「いつミルクあげた？」<br />
                                その確認、もう不要です。<br />
                                <span className="text-indigo-600">リアルタイム育児記録</span>で、<br className="hidden lg:block" />夫婦の連携をもっとスムーズに。
                            </h1>
                            <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0">
                                授乳、睡眠、おむつ交換。スマホでタップするだけで、パートナーに即通知。
                                AIアドバイスで、初めての育児も安心サポート。
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center sm:items-start">
                                {isLoggedIn ? (
                                    <Link href="/dashboard">
                                        <Button className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-105">
                                            ダッシュボードに戻る
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-2 w-full sm:w-auto items-center sm:items-start">
                                            <Link href="/register" className="w-full sm:w-auto">
                                                <Button className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-105">
                                                    無料でアカウント作成
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </Button>
                                            </Link>
                                            <div className="text-xs font-bold mt-2 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-slate-500">
                                                <span>✨ クレジットカード不要・完全無料</span>
                                                <span className="hidden sm:inline text-slate-300">|</span>
                                                <span className="text-indigo-600">1分で登録完了</span>
                                            </div>
                                        </div>
                                        <Link href="/register?join=true">
                                            <Button variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl border-slate-200 hover:bg-slate-50 transition-all">
                                                招待コードで参加する
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative z-10 bg-slate-200 rounded-[2rem] shadow-2xl border-8 border-slate-100 overflow-hidden aspect-[9/19] max-w-[300px] mx-auto">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/screenshots/dashboard.png"
                                    alt="育児記録ダッシュボードの画面。授乳や睡眠の記録が一目でわかり、AIによる分析も表示されます"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="px-4 py-24 bg-white">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight">Baby App が選ばれる理由</h2>
                            <p className="text-slate-500">家族全員が楽しく育児に関われる仕組みが整っています。</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {FEATURES.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card className="h-full rounded-3xl border-0 shadow-sm bg-slate-50/50 hover:shadow-md transition-shadow overflow-hidden">
                                        <CardContent className="p-8 space-y-6">
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", feature.color)}>
                                                {feature.icon}
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-bold">{feature.title}</h3>
                                                <p className="text-slate-600 leading-relaxed text-sm">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Detailed Features Grid */}
                <section id="details" className="px-4 py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight">充実の記録機能</h2>
                            <p className="text-slate-500">パパ・ママの声を反映した、使いやすい機能を多数搭載。</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {DETAILED_FEATURES.map((item, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center gap-4 text-center">
                                    <span className="text-4xl">{item.icon}</span>
                                    <span className="font-bold text-sm text-slate-700">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How to Section */}
                <section id="howto" className="px-4 py-24 bg-white">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight">3ステップで始められる</h2>
                            <p className="text-slate-500">難しい設定は不要。すぐに家族と育児を共有できます。</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {HOW_TO_STEPS.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 }}
                                    className="relative text-center space-y-4"
                                >
                                    <div className="relative mx-auto w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-4xl">
                                        {step.icon}
                                        <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                                            {step.step}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold">{step.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>
                        {!isLoggedIn && (
                            <div className="text-center">
                                <Link href="/register">
                                    <Button className="h-14 px-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-105">
                                        今すぐ無料で始める
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Trust Section */}
                <section className="px-4 py-24 bg-slate-50">
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

                {/* FAQ Section */}
                <section id="faq" className="px-4 py-24 bg-white">
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

                {/* Footer CTA */}
                <section className="px-4 py-24 bg-indigo-600 text-white">
                    <div className="max-w-7xl mx-auto text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-extrabold tracking-tight">さあ、今日から始めましょう</h2>
                            <p className="text-indigo-100 text-lg">
                                育児をもっと楽しく、もっとスムーズに。
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {isLoggedIn ? (
                                <Link href="/dashboard">
                                    <Button className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl shadow-xl transition-all">
                                        ダッシュボードに戻る
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/register">
                                    <Button className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl shadow-xl transition-all">
                                        今すぐ無料で始める
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="px-4 py-12 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="space-y-2">
                            <div className="text-indigo-600 font-bold text-lg">Baby App</div>
                            <p className="text-slate-400 text-sm max-w-xs">家族で共有する育児記録アプリ。授乳・睡眠・おむつをリアルタイムで記録・共有。</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                            <div className="space-y-2">
                                <p className="font-bold text-slate-700">サービス</p>
                                <div className="space-y-1">
                                    <a href="#features" className="block text-slate-500 hover:text-indigo-600 transition-colors">特徴</a>
                                    <a href="#details" className="block text-slate-500 hover:text-indigo-600 transition-colors">機能一覧</a>
                                    <a href="#howto" className="block text-slate-500 hover:text-indigo-600 transition-colors">使い方</a>
                                    <a href="#faq" className="block text-slate-500 hover:text-indigo-600 transition-colors">よくある質問</a>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="font-bold text-slate-700">情報</p>
                                <div className="space-y-1">
                                    <Link href="/about" className="block text-slate-500 hover:text-indigo-600 transition-colors">運営者情報</Link>
                                    <Link href="/privacy" className="block text-slate-500 hover:text-indigo-600 transition-colors">プライバシーポリシー</Link>
                                    <Link href="/terms" className="block text-slate-500 hover:text-indigo-600 transition-colors">利用規約</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-6 text-center text-slate-400 text-sm">
                        &copy; 2026 Baby App. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
