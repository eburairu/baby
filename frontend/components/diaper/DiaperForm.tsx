"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { DiaperType } from "@/types/diaper"

interface Props {
    babyId: string
    onSuccess: () => void
}

export function DiaperForm({ babyId, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)
    const [note, setNote] = useState("")
    const [changeTime, setChangeTime] = useState("") // Empty means "now"

    const handleSubmit = async (type: DiaperType) => {
        setLoading(true)
        try {
            await api.post("/diapers/", {
                baby_id: Number(babyId),
                diaper_type: type,
                change_time: changeTime ? new Date(changeTime).toISOString() : new Date().toISOString(),
                notes: note || undefined,
            })
            setNote("")
            setChangeTime("")
            onSuccess()
        } catch (e) {
            console.error(e)
            alert("エラーが発生しました")
        } finally {
            setLoading(false)
        }
    }

    // Helper for datetime-local input (YYYY-MM-DDThh:mm)
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChangeTime(e.target.value)
    }

    return (
        <Card className="bg-white rounded-2xl shadow-sm border-0 mb-4">
            <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <Button
                        disabled={loading}
                        onClick={() => handleSubmit(DiaperType.WET)}
                        className="h-20 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 border-0 rounded-xl"
                        variant="outline"
                    >
                        <span className="text-2xl mb-1">💧</span>
                        <span className="text-xs font-bold">おしっこ</span>
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={() => handleSubmit(DiaperType.DIRTY)}
                        className="h-20 flex flex-col items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-600 border-0 rounded-xl"
                        variant="outline"
                    >
                        <span className="text-2xl mb-1">💩</span>
                        <span className="text-xs font-bold">うんち</span>
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={() => handleSubmit(DiaperType.BOTH)}
                        className="h-20 flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-600 border-0 rounded-xl"
                        variant="outline"
                    >
                        <span className="text-2xl mb-1">💧💩</span>
                        <span className="text-xs font-bold">両方</span>
                    </Button>
                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">時刻 (指定しない場合は現在時刻)</label>
                        <input
                            type="datetime-local"
                            value={changeTime}
                            onChange={handleTimeChange}
                            className="text-sm p-2 border border-gray-200 rounded-lg w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">メモ</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="色や量など..."
                            className="text-sm p-2 border border-gray-200 rounded-lg w-full"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
