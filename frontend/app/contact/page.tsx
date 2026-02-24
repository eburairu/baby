import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, MessageCircle, AlertCircle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "お問い合わせ - Baby App",
    description: "Baby Appに関するお問い合わせ、ご意見、不具合のご報告はこちらからお願いいたします。",
}

const CONTACT_EMAIL = "ry1e@ebuchi.net"

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4">
            <div className="max-w-3xl mx-auto space-y-12">
                <Link href="/">
                    <Button variant="ghost" className="gap-2 text-slate-600">
                        <ArrowLeft className="h-4 w-4" />
                        トップページに戻る
                    </Button>
                </Link>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm space-y-10 text-slate-900">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">お問い合わせ</h1>
                        <p className="text-slate-600 leading-relaxed">
                            Baby Appをご利用いただきありがとうございます。サービスに関するご質問、ご意見、または不具合のご報告は、以下の窓口よりお問い合わせください。
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* 一般的なお問い合わせ */}
                        <div className="bg-indigo-50/50 rounded-2xl p-6 space-y-4 border border-indigo-100/50">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">一般的なお問い合わせ</h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                サービスの使い方、機能に関するご質問、またはメディア・取材に関するお問い合わせはこちら。
                            </p>
                            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block mt-4 text-indigo-600 font-bold hover:underline">
                                {CONTACT_EMAIL}
                            </a>
                        </div>

                        {/* ご意見・ご要望 */}
                        <div className="bg-rose-50/50 rounded-2xl p-6 space-y-4 border border-rose-100/50">
                            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-2">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">ご意見・ご要望</h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                「こんな機能が欲しい」「ここが使いにくい」など、皆様からのフィードバックをお待ちしております。
                            </p>
                            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block mt-4 text-rose-600 font-bold hover:underline">
                                {CONTACT_EMAIL}
                            </a>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-6 space-y-4 border border-amber-100">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                            <h2 className="text-lg font-bold text-slate-800">不具合・バグのご報告</h2>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            アプリの動作がおかしい、エラーが表示されるなどの不具合を発見された場合は、大変お手数ですが以下の情報を添えて <strong>{CONTACT_EMAIL}</strong> までご連絡ください。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 text-sm space-y-1 mt-2 bg-white/50 p-4 rounded-xl">
                            <li>ご利用の端末（例: iPhone 14, Android 等）</li>
                            <li>OSのバージョン（例: iOS 17.1）</li>
                            <li>不具合が発生した画面と具体的な操作手順</li>
                            <li>（可能であれば）エラー画面のスクリーンショット</li>
                        </ul>
                    </div>

                    <div className="border-t border-slate-100 pt-8 mt-8 text-sm text-slate-500 text-center">
                        <p>※ お問い合わせには順次対応しておりますが、内容によってはご返信までにお時間をいただく場合がございます。あらかじめご了承ください。</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
