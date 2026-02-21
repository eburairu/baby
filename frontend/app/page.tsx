"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useUser } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Baby, Smile, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

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

export default function LandingPage() {
    const { user, isLoading } = useUser()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && !isLoading && user) {
            router.push("/dashboard")
        }
    }, [mounted, isLoading, user, router])

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-100 rounded-full" />
                    <div className="h-4 w-24 bg-indigo-50 rounded" />
                </div>
            </div>
        )
    }

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
                    </nav>
                    <div>
                        <Link href="/login">
                            <Button variant="ghost" className="text-sm font-medium text-slate-600">ログイン</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-16">
                {/* Hero Section */}
                <section className="relative px-4 py-20 lg:py-32 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center lg:text-left space-y-8"
                        >
                            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                                家族の絆を、<br />
                                <span className="text-indigo-600">育育記録</span>で深める。
                            </h1>
                            <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0">
                                授乳、睡眠、おむつの記録をリアルタイムで共有。
                                AIによる振り返りで、赤ちゃんの成長をもっと身近に。
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link href="/register">
                                    <Button className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:scale-105">
                                        新しく家族を登録する
                                    </Button>
                                </Link>
                                <Link href="/register?join=true">
                                    <Button variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl border-slate-200 hover:bg-slate-50 transition-all">
                                        招待コードで参加する
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative z-10 bg-white rounded-[2rem] shadow-2xl border-8 border-slate-100 overflow-hidden aspect-[9/19] max-w-[300px] mx-auto">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src="/initial_access.png" 
                                    alt="App Screenshot" 
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
                            <Link href="/register">
                                <Button className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl shadow-xl transition-all">
                                    今すぐ無料で始める
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="px-4 py-12 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-indigo-600 font-bold text-lg">Baby App</div>
                    <div className="text-slate-400 text-sm">
                        &copy; 2026 Baby App. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm font-medium text-slate-500">
                        <Link href="/privacy" className="hover:text-indigo-600 transition-colors">プライバシーポリシー</Link>
                        <Link href="/terms" className="hover:text-indigo-600 transition-colors">利用規約</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
