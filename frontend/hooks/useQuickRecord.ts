"use client"
import { usePermissions } from "@/hooks/usePermissions"
import { useAsyncAction } from "@/hooks/useAsyncAction"
import { useRecordFeedback, RecordType } from "@/hooks/useRecordFeedback"

interface UseQuickRecordOptions {
  onSuccess?: () => void
}

export function useQuickRecord(babyId: string | number, options: UseQuickRecordOptions = {}) {
  const { canWrite } = usePermissions()
  const { loading, execute } = useAsyncAction()
  const { triggerFeedback } = useRecordFeedback(babyId)

  /**
   * クイック記録を実行する
   * @param action 非同期アクション関数 (IDを返す必要がある)
   * @param config 設定
   */
  const executeRecord = async <T extends { id: number }>(
    action: () => Promise<T>,
    config: {
      label?: string // 成功/失敗メッセージ用
      successMessage?: string
      errorMessage?: string
      feedbackType?: RecordType // これがあればフィードバックを実行
    }
  ) => {
    const { label, successMessage, errorMessage, feedbackType } = config

    return execute(async () => {
      const result = await action()

      if (feedbackType) {
        triggerFeedback(feedbackType, result.id)
      }

      if (options.onSuccess) {
        options.onSuccess()
      }

      return result
    }, {
      successMessage: successMessage ?? (label ? `${label}を記録しました` : undefined),
      errorMessage: errorMessage ?? (label ? `${label}の記録に失敗しました` : undefined)
    })
  }

  return {
    canWrite,
    loading,
    executeRecord
  }
}
