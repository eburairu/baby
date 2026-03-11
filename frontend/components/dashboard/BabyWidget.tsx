"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Hexagon } from "@/components/ui/hexagon"
import { HexagonWidgetCard } from "@/components/dashboard/HexagonWidgetCard"
import { BabyInfoPopup } from "@/components/dashboard/BabyInfoPopup"
import type { TabId } from "@/components/dashboard/BabyInfoPopup"
import { calcAge } from "@/lib/ageUtils"
import { getPrenatalLabel } from "@/lib/babyUtils"

export interface BabyForWidget {
  id: number
  name: string
  birthday?: string | null
  due_date?: string | null
  gender?: ("boy" | "girl" | "unknown") | null
  characteristics?: string | null
}

interface BabyWidgetProps {
  baby: BabyForWidget
  size?: number
}

export function BabyWidget({ baby, size }: BabyWidgetProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [open, setOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<TabId>("info")

  // URLパラメータ経由のディープリンク（通知タップ時）を処理する。
  // searchParams が変化したとき（client-side navigation 後も含む）に実行する。
  // URL パラメータ（外部システム）の変化に応答する正当な useEffect。
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const babyId = searchParams.get("baby_id")
    const tab = searchParams.get("tab")
    if (babyId !== String(baby.id) || tab !== "achievements") return

    setOpen(true)
    setActiveTab("achievements")

    const params = new URLSearchParams(searchParams.toString())
    params.delete("baby_id")
    params.delete("tab")
    const newUrl = params.size > 0 ? `?${params}` : window.location.pathname
    router.replace(newUrl)
  }, [searchParams, baby.id, router])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleManualOpen = () => {
    setActiveTab("info")
    setOpen(true)
  }

  const initial = baby.name.charAt(0) || "?"
  const ageLabel = baby.birthday
    ? calcAge(baby.birthday).label
    : getPrenatalLabel(baby.due_date)

  return (
    <>
      <button
        onClick={handleManualOpen}
        aria-label={`${baby.name}の情報を見る`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 rounded-xl"
      >
        <HexagonWidgetCard
          title={baby.name}
          icon={
            <Hexagon size={28} color="rgb(99 102 241)" cornerRadius={4}>
              <span className="text-white font-bold text-xs">{initial}</span>
            </Hexagon>
          }
          size={size}
          className="hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20"
        >
          <span>{ageLabel}</span>
        </HexagonWidgetCard>
      </button>
      <BabyInfoPopup
        baby={baby}
        open={open}
        onOpenChange={setOpen}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
      />
    </>
  )
}
