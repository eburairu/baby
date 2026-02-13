"use client"
import { useState } from "react"
import { Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

interface Props {
    name: string
    isAdmin: boolean
    onUpdated: () => void
}

export function FamilyNameForm({ name, isAdmin, onUpdated }: Props) {
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState(name)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSave = async () => {
        if (!value.trim()) {
            setError("家族名を入力してください")
            return
        }
        setSaving(true)
        setError(null)
        try {
            await api.patch("/family/", { name: value.trim() })
            setEditing(false)
            onUpdated()
        } catch {
            setError("保存に失敗しました")
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setValue(name)
        setEditing(false)
        setError(null)
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-violet-600 font-semibold text-sm">👨‍👩‍👧 家族名</span>
            </div>
            {editing ? (
                <div className="space-y-2">
                    <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="text-lg font-bold"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Check className="h-4 w-4 mr-1" />
                            保存
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
                            <X className="h-4 w-4 mr-1" />
                            キャンセル
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-gray-900">{name}</p>
                    {isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => { setValue(name); setEditing(true) }}>
                            <Pencil className="h-4 w-4 text-gray-500" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
