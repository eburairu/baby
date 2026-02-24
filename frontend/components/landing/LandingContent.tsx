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

const TESTIMONIALS = [
    {
        name: "Y.S さん (3ヶ月のママ)",
        comment: "授乳のタイミングを忘れがちでしたが、このアプリのおかげでリズムが掴めるようになりました。夫も積極的に記録してくれて助かっています！",
        rating: 5,
    },
    {
        name: "K.T さん (6ヶ月のパパ)",
        comment: "仕事中に通知が来るのが楽しみです。「あ、今ミルク飲んだんだな」と分かるだけで安心できます。シンプルなデザインで使いやすいです。",
        rating: 5,
    },
    {
        name: "M.I さん (1歳のママ)",
        comment: "夜泣きのパターンが可視化されて、寝かしつけの対策が立てやすくなりました。AIのアドバイスも意外と的確で参考になります。",
        rating: 4,
    },
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
                            {/* Floating Notification 1: Real-time sharing */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2, duration: 0.5 }}
                                className="absolute -right-12 top-24 z-20 hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-slate-100 pr-6"
                            >
                                <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                    <span className="text-xl">🍼</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">パパが記録しました</p>
                                    <p className="text-xs text-slate-500">ミルク 140ml</p>
                                </div>
                            </motion.div>

                            {/* Floating Notification 2: AI Advice */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.8, duration: 0.5 }}
                                className="absolute -left-12 bottom-32 z-20 hidden md:flex items-start gap-3 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[260px]"
                            >
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-800">AIアドバイス</p>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        そろそろお昼寝の時間かも？<br/>
                                        部屋を暗くしてみましょう 💤
                                    </p>
                                </div>
                            </motion.div>

                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                        </motion.div>
                    </div>
                </section>

                {/* Article Section (SEO & AdSense Optimization) */}
                <section className="px-4 py-24 bg-slate-50 border-t border-slate-100">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="space-y-6 text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                                育児の負担を軽減する、新しい記録のカタチ
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg text-left">
                                はじめての育児は不安や疑問の連続です。「最後の授乳から何時間経った？」「今日はおむつを何回替えた？」「最近、夜泣きが増えている気がする…」そんな日々の小さな疑問を解決するのが、Baby Appのような育児記録アプリの役割です。
                                アプリを使って記録を可視化することで、赤ちゃんの生活リズムがはっきりと見えてきます。
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">家族で育児を「シェア」するメリット</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    これまで、育児の記録は母親のノートや記憶に頼ることが多く、どうしても一人に負担が集中しがちでした。Baby Appを使えば、スマホ一つで簡単に記録ができ、そのデータはリアルタイムでパートナーや家族に共有されます。
                                    パパが仕事の休憩中に赤ちゃんの様子を確認したり、離れて暮らす祖父母が成長を見守ったりと、家族全員が育児の「当事者」として参加できる環境が生まれます。
                                    これにより、夫婦間のコミュニケーションが円滑になり、育児の孤立感を防ぐことにもつながります。
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">AIが導き出す、最適な育児リズム</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    単に記録を残すだけでなく、蓄積されたデータを活用できるのがデジタルの強みです。Baby Appでは、最新のAI技術を用いて、毎日の睡眠時間や授乳間隔から赤ちゃんの生活パターンを分析します。
                                    「そろそろお昼寝の時間かも」「ミルクの間隔が安定してきましたね」といった具体的なアドバイスをAIが提供することで、親は次に何をすべきかを予測しやすくなります。
                                    予測可能な育児は、心と時間のゆとりを生み出し、より笑顔で赤ちゃんに接することができるようになります。
                                </p>
                            </div>
                        </div>
                        <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
                            <h3 className="text-xl font-bold text-indigo-900 mb-4">ずっと残る、かけがえのない思い出として</h3>
                            <p className="text-indigo-800 leading-relaxed">
                                日々の授乳やおむつ替えの記録は、時間が経てばいつか終わるものです。しかし、アプリに残された一つひとつの記録や家族からの応援コメントは、赤ちゃんの成長の軌跡そのものです。
                                Baby Appは、単なる実用的なツールであると同時に、家族のかけがえのない思い出を記録するデジタルな母子手帳としての役割も果たします。
                                セキュリティに配慮されたプライベートな空間で、安心してお子様の成長記録を残していくことができます。
                            </p>
                        </div>
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

                {/* Testimonials Section */}
                <section className="px-4 py-24 bg-white">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight">利用者からの嬉しい声</h2>
                            <p className="text-slate-500">たくさんのご家族が、Baby Appで育児を楽しんでいます。</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {TESTIMONIALS.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card className="h-full rounded-2xl border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
                                        <CardContent className="p-8 space-y-6">
                                            <div className="flex gap-1 text-amber-400">
                                                {[...Array(5)].map((_, j) => (
                                                    <span key={j} className={j < item.rating ? "text-amber-400" : "text-slate-200"}>★</span>
                                                ))}
                                            </div>
                                            <p className="text-slate-600 leading-relaxed text-sm italic">
                                                &quot;{item.comment}&quot;
                                            </p>
                                            <div className="pt-4 border-t border-slate-50">
                                                <p className="font-bold text-sm text-slate-800">{item.name}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How to Section */}
                <section id="howto" className="px-4 py-24 bg-slate-50">
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

                {/* FAQ Section */}
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

                {/* Footer CTA */}
                <section className="px-4 py-24 bg-indigo-600 text-white">
                    <div className="max-w-7xl mx-auto text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-extrabold tracking-tight">もう、育児の記録で迷わない。</h2>
                            <p className="text-indigo-100 text-lg">
                                今日から家族みんなでシェアして、余裕のある時間を。
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
                                    <Link href="/contact" className="block text-slate-500 hover:text-indigo-600 transition-colors">お問い合わせ</Link>
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
