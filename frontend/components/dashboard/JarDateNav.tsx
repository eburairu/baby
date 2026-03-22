"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    date: Date
    onChange: (date: Date) => void
}

function formatDate(date: Date): string {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000)

    if (diff === 0) return "今日"
    if (diff === 1) return "昨日"
    return `${date.getMonth() + 1}/${date.getDate()}`
}

export function JarDateNav({ date, onChange }: Props) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const isToday = date >= today

    const prev = () => {
        const d = new Date(date)
        d.setDate(d.getDate() - 1)
        onChange(d)
    }

    const next = () => {
        if (isToday) return
        const d = new Date(date)
        d.setDate(d.getDate() + 1)
        onChange(d)
    }

    return (
        <div className="flex items-center justify-between px-1 mb-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prev}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-600 dark:text-zinc-300 min-w-[4rem] text-center">
                {formatDate(date)}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isToday} onClick={next}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
