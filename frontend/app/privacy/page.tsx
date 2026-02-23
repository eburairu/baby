import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "プライバシーポリシー",
    description: "Baby App のプライバシーポリシーです。個人情報の取り扱いについて説明します。",
}

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

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm space-y-10 text-slate-900">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">プライバシーポリシー</h1>
                        <p className="text-slate-500 text-sm">最終更新日: 2026年2月23日</p>
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                        Baby App運営者（以下「当方」）は、Baby App（以下「本サービス」）における利用者の個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">1. 運営者情報</h2>
                        <p className="text-slate-600 leading-relaxed">
                            サービス名: Baby App<br />
                            運営者: Baby App 運営者<br />
                            お問い合わせ: <a href="https://baby-app-next.onrender.com/" className="text-indigo-600 underline">サービストップページ</a>よりご確認ください。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">2. 収集する個人情報</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本サービスでは、以下の情報を収集する場合があります。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li><strong>アカウント情報:</strong> メールアドレス、パスワード（ハッシュ化して保存）、表示名</li>
                            <li><strong>育児記録データ:</strong> 授乳・ミルク記録、睡眠記録、おむつ記録、成長記録（体重・身長）、健康状態メモ</li>
                            <li><strong>赤ちゃん情報:</strong> 赤ちゃんの名前、生年月日</li>
                            <li><strong>利用ログ:</strong> アクセス日時、利用機能、エラーログ（Sentryによる収集）</li>
                            <li><strong>デバイス情報:</strong> プッシュ通知を利用する場合の通知トークン</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">3. 利用目的</h2>
                        <p className="text-slate-600 leading-relaxed">
                            収集した情報は、以下の目的でのみ利用します。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li>本サービスの提供・運営・維持・改善</li>
                            <li>家族間での育児情報のリアルタイム共有機能の実現</li>
                            <li>AIによる育児サマリー・アドバイスの生成</li>
                            <li>プッシュ通知の配信</li>
                            <li>不正アクセスや利用規約違反の検知・対応</li>
                            <li>障害・バグの検知・修正（エラーログの分析）</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">4. 第三者への提供</h2>
                        <p className="text-slate-600 leading-relaxed">
                            当方は、以下のいずれかに該当する場合を除き、収集した個人情報を第三者に提供することはありません。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li>利用者ご自身が同意された場合</li>
                            <li>法令に基づく開示要請があった場合</li>
                            <li>人の生命・身体・財産の保護のために必要で、本人の同意を得ることが困難な場合</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">5. 委託先・外部サービスの利用</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本サービスでは、以下の外部サービスを利用しており、利用目的の範囲内でデータを共有する場合があります。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li><strong>Neon（データベース）:</strong> 育児記録等のデータ保存</li>
                            <li><strong>Render（ホスティング）:</strong> サービスの稼働・配信</li>
                            <li><strong>Sentry（エラー監視）:</strong> バグ・エラーの検知と修正</li>
                            <li><strong>Google Gemini API（AI）:</strong> 育児サマリー生成時の解析</li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed text-sm mt-2">
                            ※ AIサマリー生成時、育児記録の一部データを含むプロンプトが送信される場合があります。個人を特定する情報は含みません。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">6. Cookie・ローカルストレージの利用</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本サービスでは、以下の目的でCookieおよびブラウザのローカルストレージを利用しています。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li>ログイン状態の維持（HttpOnlyセッションCookie）</li>
                            <li>アプリの設定保存（ローカルストレージ）</li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed">
                            ブラウザの設定からCookieを無効にすることができますが、その場合、一部機能が正常に動作しない場合があります。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">7. セキュリティ対策</h2>
                        <p className="text-slate-600 leading-relaxed">
                            当方は、収集した個人情報の漏洩・紛失・改ざんを防ぐため、以下のセキュリティ対策を実施しています。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li>通信のSSL/TLS暗号化</li>
                            <li>パスワードのハッシュ化（Bcrypt）</li>
                            <li>HttpOnly・SameSite属性付きセッションCookieの使用</li>
                            <li>招待制による家族以外のアクセス遮断</li>
                            <li>ロールベースアクセス制御（管理者・メンバー・閲覧者）</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">8. データの保管期間</h2>
                        <p className="text-slate-600 leading-relaxed">
                            収集した個人情報は、アカウントが有効である期間中保管します。アカウントを削除した場合、関連する個人情報も速やかに削除されます。ただし、法令上の保存義務が生じる場合はこの限りではありません。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">9. 利用者の権利</h2>
                        <p className="text-slate-600 leading-relaxed">
                            利用者は、自身の個人情報について以下の権利を有します。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li>個人情報の開示請求</li>
                            <li>個人情報の訂正・追加・削除請求</li>
                            <li>個人情報の利用停止・削除請求</li>
                            <li>アカウントの削除（アプリ内設定から実行可能）</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">10. 免責事項</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本サービスは、利用者が入力した情報の正確性・完全性について責任を負いません。また、利用者自身による情報の漏洩（招待コードの第三者共有等）について、当方は責任を負いかねます。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">11. プライバシーポリシーの改訂</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本ポリシーは、法令の改正やサービスの変更に伴い、予告なく改訂される場合があります。改訂後の内容は、本ページへの掲載をもって通知に代えるものとします。重要な変更については、アプリ内で通知します。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">12. 準拠法・管轄</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本ポリシーは日本法に準拠し、本ポリシーに関する一切の紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
