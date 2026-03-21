import { useEffect } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useBabyStore } from '@/stores/babyStore'
import { useHydratedStore } from '@/hooks/useHydratedStore'

export function useSelectedBaby() {
  const { babies, isLoading, isError, mutate } = useBabies()
  const selectedBabyId = useHydratedStore(useBabyStore, (s) => s.selectedBabyId, null)
  const setSelectedBabyId = useBabyStore((s) => s.setSelectedBabyId)
  // ストアの生の値（ハイドレーション前でも localStorage から同期的に読み込まれる）
  // useEffect 内のガード条件にのみ使用し、レンダリング出力には使わない
  const rawSelectedBabyId = useBabyStore((s) => s.selectedBabyId)

  // storeに未保存でもbabiesが取得できていれば同期的にIDを確定させる。
  // useEffect経由のsetState→再レンダリング待ちをなくすことで、
  // babies取得と同じレンダリングサイクルでuseRecordsのフェッチを開始できる。
  const effectiveSelectedBabyId =
    selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)

  // rawSelectedBabyId でガードすることで、ハイドレーション前に selectedBabyId が
  // null になる期間に storeを上書きしてしまうバグを防ぐ
  // （useHydratedStore はハイドレーション完了まで null を返すため、
  //   selectedBabyId で判定すると記録ページで設定した値が消える）
  useEffect(() => {
    if (babies && babies.length > 0 && !rawSelectedBabyId) {
      setSelectedBabyId(String(babies[0].id))
    }
  }, [babies, rawSelectedBabyId, setSelectedBabyId])

  const selectedBaby = babies?.find(b => String(b.id) === effectiveSelectedBabyId)

  return {
    babies,
    isLoading,
    isError,
    mutate,
    selectedBabyId: effectiveSelectedBabyId,
    setSelectedBabyId,
    selectedBaby,
  }
}
