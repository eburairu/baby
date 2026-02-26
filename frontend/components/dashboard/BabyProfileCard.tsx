"use client"
import React, { useState } from "react"
import { Sparkles, ChevronDown } from "lucide-react"
import { calcAge } from "@/lib/ageUtils"
import { getPrenatalLabel } from "@/lib/babyUtils"
import { Hexagon } from "@/components/ui/hexagon"

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
    const [isCharacteristicsExpanded, setIsCharacteristicsExpanded] = useState(false)
    const initial = selected?.name?.charAt(0) || "?"

    return (
        <div className="rounded-2xl p-4 transition-colors bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 shadow-sm border border-pink-100/50 dark:border-pink-900/20">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    <Hexagon size={60} color="var(--primary)" className="text-white">
                        <span className="text-2xl font-bold">{initial}</span>
                    </Hexagon>
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
                        <button
                            onClick={() => setIsCharacteristicsExpanded(!isCharacteristicsExpanded)}
                            className="flex items-center justify-between w-full mb-2 px-1 py-1 -mx-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                        >
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-500/10" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                                    赤ちゃんの特徴
                                </span>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                    isCharacteristicsExpanded ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${
                                isCharacteristicsExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}
                        >
                            <div className="overflow-hidden">
                                <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed bg-amber-50/30 dark:bg-amber-950/10 p-3.5 rounded-xl border border-amber-100/50 dark:border-amber-900/20 whitespace-pre-wrap">
                                    {selected.characteristics}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})
