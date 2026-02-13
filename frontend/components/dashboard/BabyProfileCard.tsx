"use client"
import { calcAge } from "@/lib/ageUtils"
import { Button } from "@/components/ui/button"

interface Baby {
    id: string
    name: string
    birthday?: string | null
}

interface Props {
    babies: Baby[]
    selectedBabyId: string
    onSelect: (id: string) => void
}

export function BabyProfileCard({ babies, selectedBabyId, onSelect }: Props) {
    const selected = babies.find((b) => b.id === selectedBabyId)
    const age = selected?.birthday ? calcAge(selected.birthday) : null

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selected?.name}</h1>
                    {age && (
                        <p className="text-sm text-gray-500 mt-0.5">{age.label}</p>
                    )}
                </div>
                {babies.length > 1 && (
                    <div className="flex gap-2 flex-wrap justify-end">
                        {babies.map((baby) => (
                            <Button
                                key={baby.id}
                                size="sm"
                                variant={selectedBabyId === baby.id ? "default" : "outline"}
                                onClick={() => onSelect(baby.id)}
                                className="text-xs"
                            >
                                {baby.name}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
