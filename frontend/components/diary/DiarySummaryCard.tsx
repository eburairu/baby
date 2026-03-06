"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DailySummary } from "@/types/dailySummary"

interface DiarySummaryCardProps {
    summary: DailySummary
    onEdit: (summary: DailySummary) => void
    onDelete: (summary: DailySummary) => void
    canWrite?: boolean
}

export function DiarySummaryCard({ summary, onEdit, onDelete, canWrite = true }: DiarySummaryCardProps) {
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

    const dateLabel = new Date(summary.summary_date + "T00:00:00").toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
    })

    const images = summary.image_urls ?? []

    return (
        <>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4 space-y-3 transition-colors">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">{dateLabel}</span>
                    <div className="flex items-center gap-2">
                        {summary.is_edited && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 dark:bg-zinc-800 dark:text-zinc-400 border-0">
                                ✏️ 編集済み
                            </Badge>
                        )}
                        {canWrite && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 dark:text-zinc-600 hover:text-blue-500 dark:hover:text-blue-400"
                                    onClick={() => onEdit(summary)}
                                    aria-label="編集"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400"
                                    onClick={() => onDelete(summary)}
                                    aria-label="削除"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {summary.display_content}
                </p>

                {images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {images.map((url) => (
                            <button
                                key={url}
                                type="button"
                                onClick={() => setLightboxUrl(url)}
                                className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-500"
                                aria-label="写真を拡大"
                            >
                                <Image
                                    src={url}
                                    alt="育児日誌の写真"
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <Dialog open={lightboxUrl !== null} onOpenChange={(open) => { if (!open) setLightboxUrl(null) }}>
                <DialogContent className="max-w-screen-sm p-2 bg-black border-none rounded-2xl">
                    {lightboxUrl && (
                        <div className="relative w-full aspect-square">
                            <Image
                                src={lightboxUrl}
                                alt="育児日誌の写真"
                                fill
                                className="object-contain"
                                sizes="(max-width: 640px) 100vw, 640px"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
