import { useEffect } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useBabyStore } from '@/stores/babyStore'

export function useSelectedBaby() {
  const { babies, isLoading, isError, mutate } = useBabies()
  const { selectedBabyId, setSelectedBabyId } = useBabyStore()

  // storeに未保存でもbabiesが取得できていれば同期的にIDを確定させる。
  // useEffect経由のsetState→再レンダリング待ちをなくすことで、
  // babies取得と同じレンダリングサイクルでuseRecordsのフェッチを開始できる。
  const effectiveSelectedBabyId =
    selectedBabyId ?? (babies && babies.length > 0 ? String(babies[0].id) : null)

  // storeへの永続化は引き続き行う（次回マウント時にuseEffect待ちを省くため）
  useEffect(() => {
    if (babies && babies.length > 0 && !selectedBabyId) {
      setSelectedBabyId(String(babies[0].id))
    }
  }, [babies, selectedBabyId, setSelectedBabyId])

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
