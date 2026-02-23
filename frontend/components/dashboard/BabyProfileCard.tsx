"use client"
import React from "react"
import { Sparkles } from "lucide-react"
import { calcAge } from "@/lib/ageUtils"
import { getPrenatalLabel } from "@/lib/babyUtils"

interface Baby {
    id: string
    name: string
    birthday?: string | null
    due_date?: string | null
    characteristics?: string | null
}

interface Props {
    babies: Baby[]
    selectedBabyId: string
}

export const BabyProfileCard = React.memo(function BabyProfileCard({ babies, selectedBabyId }: Props) {
    const selected = babies.find((b) => b.id === selectedBabyId)
    const age = selected?.birthday ? calcAge(selected.birthday) : null
    const prenatalLabel = !selected?.birthday ? getPrenatalLabel(selected?.due_date) : null

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-4 transition-colors">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{selected?.name}</h1>
                        {age ? (
                            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{age.label}</p>
                        ) : prenatalLabel ? (
                            <p className="text-sm text-purple-500 dark:text-purple-400 mt-0.5">{prenatalLabel}</p>
                        ) : null}
                    </div>
                </div>

                {selected?.characteristics && (
                    <div className="mt-1 pt-3 border-t border-gray-50 dark:border-zinc-800">
                        <div className="flex items-center gap-1.5 mb-2 px-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-500/10" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                                赤ちゃんの特徴
                            </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed bg-amber-50/30 dark:bg-amber-950/10 p-3.5 rounded-xl border border-amber-100/50 dark:border-amber-900/20 whitespace-pre-wrap">
                            {selected.characteristics}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
})
