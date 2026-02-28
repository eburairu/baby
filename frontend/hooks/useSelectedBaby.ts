import { useEffect } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useBabyStore } from '@/stores/babyStore'

export function useSelectedBaby() {
  const { babies, isLoading, isError, mutate } = useBabies()
  const { selectedBabyId, setSelectedBabyId } = useBabyStore()

  useEffect(() => {
    if (babies && babies.length > 0 && !selectedBabyId) {
      setSelectedBabyId(String(babies[0].id))
    }
  }, [babies, selectedBabyId, setSelectedBabyId])

  const selectedBaby = babies?.find(b => String(b.id) === selectedBabyId)

  return {
    babies,
    isLoading,
    isError,
    mutate,
    selectedBabyId,
    setSelectedBabyId,
    selectedBaby,
  }
}
