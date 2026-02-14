"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, ShieldOff, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useBabyPermissions, updateBabyPermissions, BabyPermissionsData } from "@/hooks/useBabyPermissions"

interface Baby {
  id: number
  name: string
}

interface Props {
  baby: Baby
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BabyPermissionDialog({ baby, open, onOpenChange }: Props) {
  const { data, isLoading, mutate } = useBabyPermissions(open ? baby.id : null)
  const [localData, setLocalData] = useState<BabyPermissionsData | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (data) {
      setLocalData(JSON.parse(JSON.stringify(data)))
    }
  }, [data])

  const handleToggleBaby = (userId: number, canView: boolean) => {
    if (!localData) return
    const newMembers = localData.members.map((m) => {
      if (m.user_id === userId) {
        const newPermissions = m.permissions.map((p) => {
          if (p.record_type === "baby") {
            return { ...p, can_view: canView }
          }
          return p
        })
        return { ...m, permissions: newPermissions }
      }
      return m
    })
    setLocalData({ ...localData, members: newMembers })
  }

  const handleToggleRecordType = (userId: number, recordType: string, canView: boolean) => {
    if (!localData) return
    const newMembers = localData.members.map((m) => {
      if (m.user_id === userId) {
        const newPermissions = m.permissions.map((p) => {
          if (p.record_type === recordType) {
            return { ...p, can_view: canView }
          }
          return p
        })
        return { ...m, permissions: newPermissions }
      }
      return m
    })
    setLocalData({ ...localData, members: newMembers })
  }

  const handleSave = async () => {
    if (!localData) return
    setIsSaving(true)
    try {
      const flattenedPermissions = localData.members.flatMap((m) =>
        m.permissions.map((p) => ({
          user_id: m.user_id,
          record_type: p.record_type,
          can_view: p.can_view,
        }))
      )
      await updateBabyPermissions(baby.id, flattenedPermissions)
      await mutate()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      alert("権限の更新に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  const recordTypeLabels: Record<string, string> = {
    feeding: "授乳",
    sleep: "睡眠",
    diaper: "おむつ",
    growth: "成長",
    contraction: "陣痛",
    schedule: "スケジュール",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-violet-600" />
            「{baby.name}」のアクセス権限
          </DialogTitle>
          <DialogDescription>
            メンバーごとに閲覧できる記録を設定します。
          </DialogDescription>
        </DialogHeader>

        {isLoading || !localData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {localData.members.map((member) => {
              const babyPerm = member.permissions.find((p) => p.record_type === "baby")
              const isBabyHidden = babyPerm?.can_view === false

              return (
                <div key={member.user_id} className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-semibold text-gray-900">{member.username}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 w-24">[赤ちゃん全体]</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={!isBabyHidden ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleBaby(member.user_id, true)}
                        className="text-xs h-8"
                      >
                        表示
                      </Button>
                      <Button
                        type="button"
                        variant={isBabyHidden ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleToggleBaby(member.user_id, false)}
                        className="text-xs h-8"
                      >
                        非表示
                      </Button>
                    </div>
                  </div>

                  <div className={`space-y-2 pl-4 transition-opacity ${isBabyHidden ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
                    <p className="text-xs text-gray-500 mb-2">記録タイプ別設定</p>
                    <div className="grid grid-cols-2 gap-2">
                      {member.permissions
                        .filter((p) => p.record_type !== "baby")
                        .map((p) => (
                          <div key={p.record_type} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                            <span className="text-xs text-gray-700">{recordTypeLabels[p.record_type] || p.record_type}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleRecordType(member.user_id, p.record_type, !p.can_view)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                                p.can_view ? "bg-violet-600" : "bg-gray-200"
                              }`}
                            >
                              <span
                                className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                  p.can_view ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !localData} className="bg-violet-600 hover:bg-violet-700">
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
