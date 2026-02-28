"use client"
import { AppIcons } from "@/constants/icons"

import { useState } from "react"
import { useVaccinations } from "@/hooks/useVaccination"
import { useRecordPage } from "@/hooks/useRecordPage"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCcw, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { RecordPageLayout } from "@/components/ui/record-page-layout"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { api, isApiError } from "@/lib/api"
import { VaccinationForm } from "@/components/vaccination/VaccinationForm"
import { Vaccination } from "@/types/vaccination"

export default function VaccinationsPage() {
    const {
        babyId,
        isLoading: babiesLoading,
        canWrite,
    } = useRecordPage()

    const { vaccinations, isLoading: vaxLoading, isError, mutate } = useVaccinations(babyId ?? null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState<Vaccination | null>(null)

    const handleAddClick = () => {
        setSelectedRecord(null)
        setIsFormOpen(true)
    }

    const handleEditClick = (vax: Vaccination) => {
        setSelectedRecord(vax)
        setIsFormOpen(true)
    }

    const handleGenerate = async () => {
        if (!babyId) return
        setIsGenerating(true)
        try {
            await api.post(`/vaccinations/generate?baby_id=${babyId}`, {})
            await mutate()
        } catch (e) {
            if (isApiError(e)) {
                alert((e.info as { detail?: string })?.detail || "スケジュールの生成に失敗しました")
            } else {
                alert("エラーが発生しました")
            }
        } finally {
            setIsGenerating(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            case 'postponed': return <AlertCircle className="h-4 w-4 text-amber-500" />
            default: return <Clock className="h-4 w-4 text-blue-500" />
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return "完了"
            case 'postponed': return "延期"
            default: return "予定"
        }
    }

    return (
        <RecordPageLayout
            title="予防接種"
            icon={AppIcons.vaccination}
            iconColorClass="text-blue-500 dark:text-blue-400"
            isLoading={babiesLoading}
            isDataLoading={vaxLoading}
            apiError={isError}
            babyId={babyId}
            onRefresh={() => mutate()}
        >
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100">スケジュール</h2>
                <div className="flex gap-2">
                    {canWrite && vaccinations?.length === 0 && (
                        <Button 
                            onClick={handleGenerate} 
                            disabled={isGenerating}
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        >
                            <RefreshCcw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            推奨予定を自動生成
                        </Button>
                    )}
                    {canWrite && (
                        <Button 
                            onClick={handleAddClick}
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                        >
                            <Plus className="h-4 w-4" />
                            記録を追加
                        </Button>
                    )}
                </div>
            </div>

            <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 dark:bg-zinc-800/50">
                                <tr>
                                    <th className="px-4 py-3 font-medium">ワクチン名</th>
                                    <th className="px-4 py-3 font-medium">回数</th>
                                    <th className="px-4 py-3 font-medium">予定日</th>
                                    <th className="px-4 py-3 font-medium">状態</th>
                                    <th className="px-4 py-3 font-medium">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {vaccinations?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                            予定が登録されていません。「自動生成」または「追加」から登録してください。
                                        </td>
                                    </tr>
                                ) : (
                                    vaccinations?.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-4 py-4 font-medium text-gray-900 dark:text-zinc-100">{v.vaccine_name}</td>
                                            <td className="px-4 py-4 text-gray-500">{v.dose_number} 回目</td>
                                            <td className="px-4 py-4 text-gray-500">
                                                {format(new Date(v.scheduled_date), 'yyyy/MM/dd (eee)', { locale: ja })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {getStatusIcon(v.status)}
                                                    <span className="text-xs font-medium">{getStatusText(v.status)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleEditClick(v)}
                                                    className="h-8 text-xs rounded-lg"
                                                >
                                                    詳細
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {babyId && (
                <VaccinationForm
                    babyId={Number(babyId)}
                    record={selectedRecord}
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => mutate()}
                />
            )}
        </RecordPageLayout>
    )
}
