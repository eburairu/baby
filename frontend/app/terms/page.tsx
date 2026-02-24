import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "利用規約",
    description: "Botoro の利用規約です。サービスを利用するにあたってのルールと条件をご確認ください。",
}

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

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm space-y-10 text-slate-900">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">利用規約</h1>
                        <p className="text-slate-500 text-sm">最終更新日: 2026年2月23日</p>
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                        この利用規約（以下「本規約」）は、Botoro運営者（以下「当方」）が提供するBotoro（以下「本サービス」）の利用条件を定めるものです。本サービスを利用するすべての方（以下「利用者」）は、本規約に同意した上でご利用ください。
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">1. 総則</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本規約は、本サービスの利用に関する当方と利用者との間の権利義務関係を定めることを目的とします。利用者が本サービスを利用した時点で、本規約に同意したものとみなします。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">2. 定義</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li><strong>「本サービス」:</strong> 当方が提供する育児記録共有アプリ「Botoro」およびその関連サービス。</li>
                            <li><strong>「利用者」:</strong> 本サービスのアカウントを作成・利用するすべての個人。</li>
                            <li><strong>「ファミリー」:</strong> 本サービス上の招待制グループ単位。</li>
                            <li><strong>「コンテンツ」:</strong> 利用者が本サービスに登録・投稿するすべての情報（育児記録、コメント等）。</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">3. 利用条件</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本サービスは、以下の条件を満たす方のみご利用いただけます。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li>本規約に同意された方</li>
                            <li>13歳以上の方（13歳未満の方は保護者の同意が必要です）</li>
                            <li>過去に本規約違反により利用停止となっていない方</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">4. アカウント管理</h2>
                        <p className="text-slate-600 leading-relaxed">
                            利用者は、以下の事項を遵守してください。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li>登録情報（メールアドレス・パスワード等）を正確かつ最新の状態に保つこと。</li>
                            <li>パスワードを第三者と共有しないこと。</li>
                            <li>招待コードを家族以外の第三者に不用意に共有しないこと。</li>
                            <li>アカウントが不正に利用された場合、直ちに当方に通知すること。</li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed">
                            アカウントの管理は利用者ご自身の責任で行っていただきます。アカウントの不正利用によって生じた損害について、当方は責任を負いません。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">5. 禁止事項</h2>
                        <p className="text-slate-600 leading-relaxed">
                            利用者は、本サービスの利用にあたり、以下の行為を行ってはなりません。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li>法令または公序良俗に違反する行為</li>
                            <li>犯罪に関連する行為</li>
                            <li>本サービスのサーバー・ネットワークへの不正アクセス</li>
                            <li>本サービスの運営を妨害する行為</li>
                            <li>他の利用者への嫌がらせ・誹謗中傷</li>
                            <li>第三者の個人情報を無断で収集・利用する行為</li>
                            <li>当方の許可なく本サービスを商業目的で利用する行為</li>
                            <li>リバースエンジニアリング・逆コンパイル等</li>
                            <li>本サービスに含まれるすべてのコンテンツを無断で複製・転用する行為</li>
                            <li>その他当方が不適切と判断する行為</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">6. コンテンツの扱い</h2>
                        <p className="text-slate-600 leading-relaxed">
                            利用者が本サービスに登録したコンテンツの権利は、引き続き利用者に帰属します。ただし、利用者はサービス提供に必要な範囲内で、当方がコンテンツを使用することを許諾するものとします（AI分析・サマリー生成等）。
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            利用者は、自身が登録するコンテンツが第三者の権利（著作権・肖像権等）を侵害しないことについて保証するものとします。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">7. 知的財産権</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本サービスのデザイン・ロゴ・ソフトウェア・文章等の知的財産権は、当方または正当な権利者に帰属します。利用者は、本規約で認められた範囲を超えて、これらを利用することはできません。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">8. 免責事項</h2>
                        <p className="text-slate-600 leading-relaxed">
                            当方は、以下について責任を負いません。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li>本サービスの中断・停止・廃止により生じた損害</li>
                            <li>利用者が登録したコンテンツの正確性・完全性</li>
                            <li>AIサマリー・アドバイスの医学的正確性（本サービスは医療アドバイスを提供するものではありません）</li>
                            <li>利用者間または利用者と第三者の間で生じたトラブル</li>
                            <li>第三者による不正アクセス・情報漏洩</li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed text-sm bg-amber-50 p-3 rounded-lg border border-amber-100">
                            ⚠️ 本サービスが提供するAIによる育児アドバイスは参考情報です。お子様の健康に関するご判断は、必ず医師・専門家にご相談ください。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">9. サービスの変更・停止・終了</h2>
                        <p className="text-slate-600 leading-relaxed">
                            当方は、以下の場合にサービスを変更・一時停止・終了することがあります。運営上やむを得ない場合を除き、事前にお知らせします。
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
                            <li>システムのメンテナンス・更新時</li>
                            <li>天災・インフラ障害等の不可抗力が発生した場合</li>
                            <li>運営継続が困難と当方が判断した場合</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">10. アカウントの停止・削除</h2>
                        <p className="text-slate-600 leading-relaxed">
                            利用者が本規約に違反した場合、当方は予告なくアカウントを停止または削除することがあります。また、利用者はいつでも設定画面からアカウントを削除できます。アカウント削除後のデータ復元はできません。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">11. 規約の改訂</h2>
                        <p className="text-slate-600 leading-relaxed">
                            当方は、必要に応じて本規約を改訂することがあります。重要な変更は事前にアプリ内でお知らせします。改訂後にサービスを継続して利用した場合、新しい利用規約に同意したものとみなします。
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-100 pb-2">12. 準拠法・管轄</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本規約は日本法に準拠します。本サービスに関する紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
