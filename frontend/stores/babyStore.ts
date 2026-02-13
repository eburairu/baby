import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BabyStore {
  selectedBabyId: string | null
  setSelectedBabyId: (id: string | null) => void
}

export const useBabyStore = create<BabyStore>()(
  persist(
    (set) => ({
      selectedBabyId: null,
      setSelectedBabyId: (id) => set({ selectedBabyId: id }),
    }),
    { name: 'baby-store' }
  )
)
