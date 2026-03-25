import useSWR from "swr"
import { fetcher, api } from "@/lib/api"
import type { Relative, RelativeCreate, RelativeUpdate } from "@/types/relative"

export function useRelatives(babyId: number | string | null) {
  const numericId = typeof babyId === "string" ? parseInt(babyId, 10) : babyId
  const url = numericId ? `/babies/${numericId}/relatives` : null

  const { data, error, isLoading, mutate } = useSWR<Relative[]>(url, fetcher, {
    keepPreviousData: true,
  })

  const addRelative = async (body: RelativeCreate): Promise<Relative | undefined> => {
    if (!numericId) return
    const result = await api.post<Relative, RelativeCreate>(`/babies/${numericId}/relatives`, body)
    mutate()
    return result
  }

  const updateRelative = async (id: number, body: RelativeUpdate): Promise<Relative | undefined> => {
    if (!numericId) return
    const result = await api.patch<Relative, RelativeUpdate>(`/babies/${numericId}/relatives/${id}`, body)
    mutate()
    return result
  }

  const deleteRelative = async (id: number): Promise<void> => {
    if (!numericId) return
    await api.delete(`/babies/${numericId}/relatives/${id}`)
    mutate()
  }

  return {
    relatives: data ?? [],
    isLoading,
    isError: error,
    addRelative,
    updateRelative,
    deleteRelative,
    mutate,
  }
}
