"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAISettings, updateAISettings } from "@/hooks/useAISettings"
import { usePermissions } from "@/hooks/usePermissions"
import { useUser } from "@/hooks/useAuth"
import { useSelectedBaby } from "@/hooks/useSelectedBaby"
import { isBorn } from "@/lib/babyUtils"
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AISettingsPage() {
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useUser()
  const { data, isLoading, isError, mutate } = useAISettings()
  const { isAdmin, isLoading: isPermsLoading } = usePermissions()
  const { selectedBaby, isLoading: isBabiesLoading } = useSelectedBaby()
  
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const born = selectedBaby ? isBorn(selectedBaby.birthday) : false

  // 初期データのセット
  useEffect(() => {
    if (data?.settings) {
      const initialForm: Record<string, string> = {}
      Object.entries(data.settings).forEach(([key, value]) => {
        initialForm[key] = String(value)
      })
      setFormData(initialForm)
    }
  }, [data])

  // 権限チェック
  useEffect(() => {
    if (!isPermsLoading && !isUserLoading && !isAdmin && !user?.is_superadmin) {
      toast.error("管理者権限が必要です")
      router.push("/settings")
    }
  }, [isAdmin, isPermsLoading, isUserLoading, user, router])

  if (isLoading || isPermsLoading || isUserLoading || isBabiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (isError || (!isAdmin && !user?.is_superadmin)) return null

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleToggle = (key: string, enabled: boolean) => {
    handleChange(key, String(enabled))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateAISettings(formData)
      await mutate()
      setHasChanges(false)
      toast.success("AI 設定を保存しました")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "設定の保存に失敗しました"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-20">
      <SettingsHeader title="AI 設定" />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* モデル選択 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              LLM モデル
            </CardTitle>
            <CardDescription>
              使用する言語モデルを選択します。最新の Gemini モデルが利用可能です。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="llm_model">メインモデル</Label>
              <select
                id="llm_model"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.llm_model || ""}
                onChange={(e) => handleChange("llm_model", e.target.value)}
              >
                {data?.available_models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.id})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {data?.available_models.find(m => m.id === formData.llm_model)?.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 生成パラメーター */}
        <Card>
          <CardHeader>
            <CardTitle>パラメーター調整</CardTitle>
            <CardDescription>
              AI の応答の創造性や長さを細かく制御します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label htmlFor="llm_temperature">Temperature ({formData.llm_temperature})</Label>
                <span className="text-xs text-muted-foreground">0.0 (厳密) 〜 1.0 (創造的)</span>
              </div>
              <input
                id="llm_temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="w-full accent-violet-500"
                value={formData.llm_temperature || "0.7"}
                onChange={(e) => handleChange("llm_temperature", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="llm_max_tokens">最大出力トークン数</Label>
              <Input
                id="llm_max_tokens"
                type="number"
                min="100"
                max="4000"
                value={formData.llm_max_tokens || "800"}
                onChange={(e) => handleChange("llm_max_tokens", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                1回あたりの最大応答長です。コスト管理に役立ちます。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 機能トグル */}
        <Card>
          <CardHeader>
            <CardTitle>機能の有効化</CardTitle>
            <CardDescription>
              各 AI 機能を個別に ON/OFF できます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>育児相談チャット</Label>
                <p className="text-xs text-muted-foreground">過去の記録を元にした AI との対話</p>
              </div>
              <Switch
                checked={formData.ai_enabled_chat === "true"}
                onCheckedChange={(checked) => handleToggle("ai_enabled_chat", checked)}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t">
              <div className="space-y-0.5">
                <Label>AI 日誌生成</Label>
                <p className="text-xs text-muted-foreground">1日の記録から物語風の日誌を作成</p>
              </div>
              <Switch
                checked={formData.ai_enabled_summary === "true"}
                onCheckedChange={(checked) => handleToggle("ai_enabled_summary", checked)}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t">
              <div className="space-y-0.5">
                <Label>記録フィードバック</Label>
                <p className="text-xs text-muted-foreground">記録直後の短い分析コメント</p>
              </div>
              <Switch
                checked={formData.ai_enabled_feedback === "true"}
                onCheckedChange={(checked) => handleToggle("ai_enabled_feedback", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 保存ボタン (Floating) */}
        <div className={cn(
          "fixed left-0 right-0 px-4 max-w-2xl mx-auto flex justify-center pointer-events-none z-40 transition-all",
          born ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-6" : "bottom-6"
        )}>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="w-full shadow-lg bg-violet-600 hover:bg-violet-700 text-white pointer-events-auto gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            設定を保存する
          </Button>
        </div>
      </div>
    </div>
  )
}
