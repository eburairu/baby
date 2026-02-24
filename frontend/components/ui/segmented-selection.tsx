"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { UI_FORMS } from "@/constants/ui-colors"

export type SelectionVariant = keyof typeof UI_FORMS.selection

interface SegmentedSelectionOption<T> {
  label: React.ReactNode
  value: T
  variant?: SelectionVariant
}

interface SegmentedSelectionProps<T> {
  options: SegmentedSelectionOption<T>[]
  value: T
  onChange: (value: T) => void
  variant?: SelectionVariant
  className?: string
  itemClassName?: string
}

/**
 * 複数の選択肢から1つを選ぶためのセグメント化された選択コンポーネント。
 * フォーム内での直感的な選択UIを提供します。
 */
export function SegmentedSelection<T extends string | number | null>({
  options,
  value,
  onChange,
  variant: defaultVariant = "blueSolid",
  className,
  itemClassName,
}: SegmentedSelectionProps<T>) {
  return (
    <div className={cn("flex gap-2", className)}>
      {options.map((option) => {
        const variant = option.variant || defaultVariant
        const variantStyles = UI_FORMS.selection[variant]
        const isActive = value === option.value

        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-lg border py-2 text-xs font-medium transition-colors",
              isActive ? variantStyles.active : variantStyles.inactive,
              itemClassName
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
