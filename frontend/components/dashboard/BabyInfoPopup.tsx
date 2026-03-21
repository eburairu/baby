"use client"

import React from "react"
import Link from "next/link"
import { Edit, Sparkles } from "lucide-react"
import { Hexagon } from "@/components/ui/hexagon"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"
import { calcAge } from "@/lib/ageUtils"
import { getPrenatalLabel } from "@/lib/babyUtils"
import { formatJapaneseDate } from "@/lib/dateUtils"
import { usePermissions } from "@/hooks/usePermissions"
import { AchievementTab } from "@/components/achievements/AchievementTab"
import { cn } from "@/lib/utils"
import { GENDER_LABELS } from "@/constants/ui"

interface BabyForWidget {
  id: number
  name: string
  birthday?: string | null
  due_date?: string | null
  gender?: ("boy" | "girl" | "unknown") | null
  characteristics?: string | null
}

export type TabId = "info" | "achievements"

interface BabyInfoPopupProps {
  baby: BabyForWidget
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTab: TabId
  onActiveTabChange: (tab: TabId) => void
}

const formatBirthday = (birthday: string): string => {
  return formatJapaneseDate(birthday)
}

const TABS: { id: TabId; label: string }[] = [
  { id: "info", label: "情報" },
  { id: "achievements", label: "実績" },
]

export function BabyInfoPopup({ baby, open, onOpenChange, activeTab, onActiveTabChange }: BabyInfoPopupProps) {
  const { isAdmin } = usePermissions()

  const ageLabel = baby.birthday
    ? calcAge(baby.birthday).label
    : getPrenatalLabel(baby.due_date)

  const birthdayDisplay = baby.birthday
    ? formatBirthday(baby.birthday)
    : "未登録"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] rounded-t-[10px] overflow-y-auto"
      >
        <SheetHeader className="items-center pb-4">
          <div className="flex justify-center mb-2">
            <Hexagon size={56} color="var(--primary)" cornerRadius={8}>
              <span className="text-white font-bold text-xl">
                {baby.name.charAt(0) || "?"}
              </span>
            </Hexagon>
          </div>
          <SheetTitle className="text-xl font-bold">{baby.name}</SheetTitle>
          <SheetDescription>{ageLabel}</SheetDescription>
        </SheetHeader>

        {/* タブ */}
        <div className="flex border-b border-border/50 mb-4" role="tablist" aria-label="赤ちゃん情報のタブ">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onActiveTabChange(tab.id)}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 情報タブ */}
        {activeTab === "info" && (
          <div className="space-y-3 py-2" role="tabpanel" id="tabpanel-info" aria-labelledby="tab-info">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">誕生日</span>
              <span className="text-sm font-medium">{birthdayDisplay}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">性別</span>
              <span className="text-sm font-medium">{baby.gender ? GENDER_LABELS[baby.gender] ?? "不明" : "不明"}</span>
            </div>

            {baby.characteristics && (
              <div className="py-2 border-b border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-muted-foreground">特徴</span>
                </div>
                <p className="text-sm font-medium whitespace-pre-wrap">{baby.characteristics}</p>
              </div>
            )}

            {isAdmin && (
              <div className="pt-4">
                <SheetClose asChild>
                  <Link
                    href="/settings/babies"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-medium text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    赤ちゃん情報を編集
                  </Link>
                </SheetClose>
              </div>
            )}
          </div>
        )}

        {/* 実績タブ */}
        {activeTab === "achievements" && (
          <div role="tabpanel" id="tabpanel-achievements" aria-labelledby="tab-achievements">
            <AchievementTab babyId={baby.id} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
