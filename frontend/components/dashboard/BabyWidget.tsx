"use client"

import React, { useState } from "react"
import { Hexagon } from "@/components/ui/hexagon"
import { HexagonWidgetCard } from "@/components/dashboard/HexagonWidgetCard"
import { BabyInfoPopup } from "@/components/dashboard/BabyInfoPopup"
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
  const [open, setOpen] = useState<boolean>(false)

  const initial = baby.name.charAt(0) || "?"
  const ageLabel = baby.birthday
    ? calcAge(baby.birthday).label
    : getPrenatalLabel(baby.due_date)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`${baby.name}の情報を見る`}
        className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 rounded-xl"
      >
        <HexagonWidgetCard
          title={baby.name}
          icon={
            <Hexagon size={28} color="rgb(99 102 241)">
              <span className="text-white font-bold text-xs">{initial}</span>
            </Hexagon>
          }
          size={size}
          className="hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20"
        >
          <span>{ageLabel}</span>
        </HexagonWidgetCard>
      </button>
      <BabyInfoPopup baby={baby} open={open} onOpenChange={setOpen} />
    </>
  )
}
