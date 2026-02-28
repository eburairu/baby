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

interface BabyForWidget {
  id: number
  name: string
  birthday?: string | null
  due_date?: string | null
  gender?: ("boy" | "girl" | "unknown") | null
  characteristics?: string | null
}

interface BabyInfoPopupProps {
  baby: BabyForWidget
  open: boolean
  onOpenChange: (open: boolean) => void
}

const genderLabel = (g: string | null | undefined): string => {
  if (g === "boy") return "男の子"
  if (g === "girl") return "女の子"
  return "不明"
}

const formatBirthday = (birthday: string): string => {
  const d = new Date(birthday)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function BabyInfoPopup({ baby, open, onOpenChange }: BabyInfoPopupProps) {
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
            <Hexagon size={56} color="var(--primary)">
              <span className="text-white font-bold text-xl">
                {baby.name.charAt(0) || "?"}
              </span>
            </Hexagon>
          </div>
          <SheetTitle className="text-xl font-bold">{baby.name}</SheetTitle>
          <SheetDescription>{ageLabel}</SheetDescription>
        </SheetHeader>

        <div className="space-y-3 py-2">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">誕生日</span>
            <span className="text-sm font-medium">{birthdayDisplay}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">性別</span>
            <span className="text-sm font-medium">{genderLabel(baby.gender)}</span>
          </div>

          {baby.characteristics && (
            <div className="py-2 border-b border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-muted-foreground">特徴</span>
              </div>
              <p className="text-sm font-medium">{baby.characteristics}</p>
            </div>
          )}
        </div>

        <div className="pt-4">
          <SheetClose asChild>
            <Link
              href={`/babies/${baby.id}/edit`}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-medium text-sm"
            >
              <Edit className="w-4 h-4" />
              プロフィールを編集
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
