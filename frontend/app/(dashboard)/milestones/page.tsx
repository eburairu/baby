"use client"

import { useMilestoneTimeline } from "@/hooks/useData"
import { useRecordPage } from "@/hooks/useRecordPage"
import { Button } from "@/components/ui/button"
import { Plus, Trophy, Image as ImageIcon, Calendar, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { RecordPageLayout } from "@/components/ui/record-page-layout"
import { format } from "date-fns"
import Image from "next/image"
import { useState } from "react"
import { MilestoneForm } from "@/components/milestone/MilestoneForm"
import { Milestone } from "@/types/milestone"

export default function MilestonesPage() {
    const {
        babyId,
        isLoading: babiesLoading,
        canWrite,
    } = useRecordPage()

    const { timeline, isLoading: milestonesLoading, isError, mutate } = useMilestoneTimeline(babyId ?? null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState<Milestone | null>(null)

    const handleAddClick = () => {
        setSelectedRecord(null)
        setIsFormOpen(true)
    }

    const handleEditClick = (milestone: Milestone) => {
        setSelectedRecord(milestone)
        setIsFormOpen(true)
    }

    return (
        <RecordPageLayout
            title="発育発達マイルストーン"
            icon={Trophy}
            iconColorClass="text-amber-500 dark:text-amber-400"
            isLoading={babiesLoading}
            isDataLoading={milestonesLoading}
            apiError={isError}
            babyId={babyId}
            onRefresh={() => mutate()}
        >
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100">発育発達タイムライン</h2>
                {canWrite && (
                    <Button 
                        onClick={handleAddClick}
                        className="gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md"
                    >
                        <Plus className="h-4 w-4" />
                        新しい「できたね！」
                    </Button>
                )}
            </div>

            <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-100 dark:before:bg-amber-900/30">
                {timeline?.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                        まだ記録がありません。
                        初めての笑顔や寝返りを記録しましょう！
                    </div>
                ) : (
                    timeline?.map((group) => (
                        <div key={group.month_age} className="relative pl-10">
                            {/* Time circle indicator */}
                            <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-amber-500/30 z-10">
                                {group.month_age}m
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                    生後 {group.month_age} ヶ月
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {group.milestones.map((m) => (
                                        <Card key={m.id} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                                            <div className="flex">
                                                {m.image_urls && m.image_urls.length > 0 ? (
                                                    <div className="relative w-24 h-24 flex-shrink-0">
                                                        <Image
                                                            src={m.image_urls[0]}
                                                            alt={m.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="96px"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center flex-shrink-0">
                                                        <ImageIcon className="h-6 w-6 text-amber-200" />
                                                    </div>
                                                )}
                                                
                                                <CardContent className="p-4 flex flex-col justify-between flex-grow min-w-0">
                                                    <div>
                                                        <div className="flex items-center justify-between gap-1">
                                                            <h4 className="font-bold text-gray-900 dark:text-zinc-100 truncate">{m.title}</h4>
                                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                                                                <Calendar className="h-2.5 w-2.5" />
                                                                {format(new Date(m.achieved_date), 'MM/dd')}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                            {m.notes || "成長の記録が保存されました。"}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex justify-end mt-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => handleEditClick(m)}
                                                            className="h-6 text-[10px] px-2 rounded-lg gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            詳細 <ChevronRight className="h-2.5 w-2.5" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {babyId && (
                <MilestoneForm
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
