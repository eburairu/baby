import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, MessageCircle, AlertCircle, ExternalLink } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "お問い合わせ - Baby App",
    description: "Baby Appに関するお問い合わせ、ご意見、不具合のご報告はこちらからお願いいたします。",
}

const CONTACT_FORM_URL = "https://forms.gle/JKkkRdm37bfTKwqn6"

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
                            Baby Appをご利用いただきありがとうございます。サービスに関するご質問、ご意見、または不具合のご報告は、専用のお問い合わせフォームよりお願いいたします。
                        </p>
                    </div>

                    <div className="bg-indigo-50/50 rounded-2xl p-8 space-y-6 border border-indigo-100/50 text-center">
                        <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                            <Mail className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-800">お問い合わせフォーム</h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                一般的なご質問、メディア・取材のご依頼、機能の追加要望、またはアプリの不具合報告など、<br className="hidden md:block" />すべてのご連絡をこちらのフォームにて承っております。
                            </p>
                        </div>
                        
                        <a 
                            href={CONTACT_FORM_URL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                        >
                            お問い合わせフォームを開く
                            <ExternalLink className="w-5 h-5" />
                        </a>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* ご意見・ご要望についてのご案内 */}
                        <div className="bg-rose-50/50 rounded-2xl p-6 space-y-4 border border-rose-100/50">
                            <div className="flex items-center gap-3">
                                <MessageCircle className="w-6 h-6 text-rose-600" />
                                <h2 className="text-lg font-bold text-slate-800">ご意見・ご要望</h2>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                「こんな機能が欲しい」「ここが使いにくい」など、皆様からのフィードバックをお待ちしております。フォームの「お問い合わせ種別」からご選択ください。
                            </p>
                        </div>

                        {/* 不具合のご報告についてのご案内 */}
                        <div className="bg-amber-50 rounded-2xl p-6 space-y-4 border border-amber-100">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                                <h2 className="text-lg font-bold text-slate-800">不具合・バグのご報告</h2>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                エラーが表示されるなどの不具合を発見された場合は、大変お手数ですがフォームの「お問い合わせ種別」にて不具合のご報告を選択し、以下の情報を添えてご連絡ください。
                            </p>
                            <ul className="list-disc list-inside text-slate-600 text-sm space-y-1 mt-2 bg-white/50 p-4 rounded-xl">
                                <li>ご利用の端末・OSバージョン</li>
                                <li>不具合が発生した画面と操作手順</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8 mt-8 text-sm text-slate-500 text-center">
                        <p>※ お問い合わせには順次対応しておりますが、内容によってはご返信までにお時間をいただく場合がございます。あらかじめご了承ください。</p>
                    </div>
                </div>
            </div>
        </div>
    )
}