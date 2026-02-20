"use client"
import React from "react"
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
                        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed italic bg-slate-50/50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-100/50 dark:border-zinc-800/50 relative whitespace-pre-wrap">
                            <span className="text-indigo-300 dark:text-indigo-700 absolute top-0 left-1 text-2xl font-serif">“</span>
                            {selected.characteristics}
                            <span className="text-indigo-300 dark:text-indigo-700 absolute bottom-0 right-1 text-2xl font-serif">”</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
})
