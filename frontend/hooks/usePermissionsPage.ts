"use client"

import useSWR from "swr"
import { useMemo } from "react"
import { fetcher } from "@/lib/api"
import type { BabyPermissionsData } from "./useBabyPermissions"

type Baby = { id: number; name: string }

type FamilyMember = {
  user_id: number
  username: string
  display_name: string | null
  role: string
  joined_at: string
}

export type BabyAccess = {
  babyId: number
  babyName: string
  /** record_type -> can_view (デフォルト false) */
  permissions: Record<string, boolean>
}

export type MemberPermissions = {
  userId: number
  username: string
  displayName: string | null
  role: string
  babyAccess: BabyAccess[]
}

const ALL_RECORD_TYPES = [
  "baby",
  "feeding",
  "sleep",
  "diaper",
  "growth",
  "contraction",
  "schedule",
  "note",
]

export function usePermissionsPage() {
  const { data: members, isLoading: membersLoading } =
    useSWR<FamilyMember[]>("/family/members", fetcher)
  const { data: babies, isLoading: babiesLoading } =
    useSWR<Baby[]>("/babies/", fetcher)

  // babyIds をキーにして全赤ちゃんの権限を一括取得
  const babyIdsKey = babies && babies.length > 0
    ? `permissions:${babies.map((b) => b.id).join(",")}`
    : null

  const {
    data: allPermsData,
    isLoading: permsLoading,
    mutate,
  } = useSWR<BabyPermissionsData[]>(
    babyIdsKey,
    async (): Promise<BabyPermissionsData[]> => {
      if (!babies || babies.length === 0) return []
      const results = await Promise.all(
        babies.map((baby) => fetcher(`/babies/${baby.id}/permissions`))
      )
      return results as BabyPermissionsData[]
    },
    { revalidateOnFocus: false }
  )

  const memberPermissions: MemberPermissions[] = useMemo(() => {
    if (!members || !babies || !allPermsData) return []

    const nonAdminMembers = members.filter((m) => m.role !== "admin")

    return nonAdminMembers.map((member) => {
      const babyAccess: BabyAccess[] = babies.map((baby) => {
        const babyPermsData = allPermsData.find((p) => p.baby_id === baby.id)
        const memberData = babyPermsData?.members.find(
          (m) => m.user_id === member.user_id
        )

        const permissions: Record<string, boolean> = {}
        // デフォルト拒否
        ALL_RECORD_TYPES.forEach((rt) => {
          permissions[rt] = false
        })
        if (memberData) {
          memberData.permissions.forEach((p) => {
            permissions[p.record_type] = p.can_view
          })
        }

        return { babyId: baby.id, babyName: baby.name, permissions }
      })

      return {
        userId: member.user_id,
        username: member.username,
        displayName: member.display_name,
        role: member.role,
        babyAccess,
      }
    })
  }, [members, babies, allPermsData])

  return {
    memberPermissions,
    babies: babies ?? [],
    isLoading: membersLoading || babiesLoading || permsLoading,
    mutate,
  }
}
