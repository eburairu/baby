"use client"
import { calcAge } from "@/lib/ageUtils"
import { getPrenatalLabel } from "@/lib/babyUtils"
import { Button } from "@/components/ui/button"

interface Baby {
    id: string
    name: string
    birthday?: string | null
    due_date?: string | null
}

interface Props {
    babies: Baby[]
    selectedBabyId: string
    onSelect: (id: string) => void
}

export function BabyProfileCard({ babies, selectedBabyId, onSelect }: Props) {
    const selected = babies.find((b) => b.id === selectedBabyId)
    const age = selected?.birthday ? calcAge(selected.birthday) : null
    const prenatalLabel = !selected?.birthday ? getPrenatalLabel(selected?.due_date) : null

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-4 transition-colors">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{selected?.name}</h1>
                    {age ? (
                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{age.label}</p>
                    ) : prenatalLabel ? (
                        <p className="text-sm text-purple-500 dark:text-purple-400 mt-0.5">{prenatalLabel}</p>
                    ) : null}
                </div>
                {babies.length > 1 ? (
                    <div className="flex gap-2 flex-wrap justify-end">
                        {babies.map((baby) => (
                            <Button
                                key={baby.id}
                                size="sm"
                                variant={selectedBabyId === baby.id ? "default" : "outline"}
                                onClick={() => onSelect(baby.id)}
                                className={selectedBabyId === baby.id
                                    ? "text-xs shadow-none"
                                    : "text-xs dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"}
                            >
                                {baby.name}
                            </Button>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
