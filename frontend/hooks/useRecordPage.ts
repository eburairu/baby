"use client"

import { useSearchParams } from "next/navigation"
import { useBabies } from "@/hooks/useBabies"
import { usePermissions } from "@/hooks/usePermissions"
import { useBabyStore } from "@/stores/babyStore"
import { useHydratedStore } from "@/hooks/useHydratedStore"
import { useRecordFeedback } from "@/hooks/useRecordFeedback"
import { useMemo, useEffect } from "react"

/**
 * 記録ページ共通のデータ解決および権限チェックフック
 */
export function useRecordPage() {
    const searchParams = useSearchParams()
    const { babies, isLoading: babiesLoading } = useBabies()
    const selectedBabyId = useHydratedStore(useBabyStore, (s) => s.selectedBabyId, null)
    const setSelectedBabyId = useBabyStore((s) => s.setSelectedBabyId)
    const { canWrite } = usePermissions()

    const paramBabyId = searchParams.get("baby_id")

    // URLパラメータの baby_id をストアに同期する
    // これにより記録ページからダッシュボードに戻っても選択状態が維持される
    useEffect(() => {
        if (paramBabyId) {
            setSelectedBabyId(paramBabyId)
        }
    }, [paramBabyId, setSelectedBabyId])
    const commentRecordIdStr = searchParams.get("comment")

    // 赤ちゃんIDの解決ロジック:
    // 1. URLパラメータ (baby_id)
    // 2. babyStore の選択状態 (selectedBabyId)
    // 3. データ一覧の最初の1人目
    const babyId = useMemo(() => {
        if (paramBabyId) return paramBabyId
        if (selectedBabyId) return selectedBabyId
        if (babies && babies.length > 0) return String(babies[0].id)
        return undefined
    }, [paramBabyId, selectedBabyId, babies])

    const { triggerFeedback } = useRecordFeedback(babyId ?? null)

    const commentRecordId = useMemo(() => {
        return commentRecordIdStr ? parseInt(commentRecordIdStr, 10) : undefined
    }, [commentRecordIdStr])

    return {
        /** 解決された赤ちゃんID */
        babyId,
        /** 赤ちゃん情報一覧 */
        babies,
        /** 赤ちゃん情報の初期読み込み中フラグ */
        isLoading: babiesLoading,
        /** 編集・作成権限の有無 */
        canWrite,
        /** 記録成功後のフィードバック発火関数 */
        triggerFeedback,
        /** URLから取得したコメント対象のレコードID */
        commentRecordId,
    }
}
