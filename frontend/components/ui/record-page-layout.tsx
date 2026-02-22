"use client"

import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"
import { PageLoading } from "@/components/ui/page-loading"
import { AccessDenied } from "@/components/ui/access-denied"
import { isApiError } from "@/lib/api"

interface RecordPageLayoutProps {
    /** ページタイトル */
    title: string
    /** ページアイコン */
    icon: LucideIcon
    /** アイコンの色 (CSS class) */
    iconColorClass: string
    /** ページ全体の初期ロード中フラグ */
    isLoading?: boolean
    /** APIエラー (403判定に使用) */
    apiError?: any
    /** 対象の赤ちゃんID (未選択時のチェックに使用) */
    babyId?: string
    /** 子要素 (メインコンテンツ) */
    children: ReactNode
}

/**
 * 育児記録ページ共通のレイアウト・エラーハンドリング・ローディング表示コンポーネント
 */
export function RecordPageLayout({
    title,
    icon: Icon,
    iconColorClass,
    isLoading,
    apiError,
    babyId,
    children,
}: RecordPageLayoutProps) {
    // 赤ちゃん情報や権限の初期ロード中
    if (isLoading) {
        return <PageLoading />
    }

    // 対象の赤ちゃんが特定できない場合
    if (!babyId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
                <p className="text-muted-foreground">赤ちゃんが登録されていないか、選択されていません。</p>
            </div>
        )
    }

    // 権限エラー (403 Forbidden)
    const isAccessDenied = isApiError(apiError) && apiError.status === 403

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-24 transition-colors">
            {/* 共通ヘッダー */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-center h-14 px-4 max-w-2xl mx-auto">
                    <h1 className="text-base font-semibold text-gray-800 dark:text-zinc-100 flex items-center gap-1.5">
                        <Icon className={`h-4 w-4 ${iconColorClass}`} />
                        {title}
                    </h1>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-2xl mx-auto p-4 space-y-6">
                {isAccessDenied ? <AccessDenied /> : children}
            </main>
        </div>
    )
}
