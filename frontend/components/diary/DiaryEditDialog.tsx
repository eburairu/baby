"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, ImagePlus, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DailySummary } from "@/types/dailySummary"
import { compressImage, ImageTooLargeError } from "@/lib/imageCompression"
import { uploadImage } from "@/lib/uploadImage"
import { EditDialogBase } from "@/components/records/EditDialogBase"

const MAX_IMAGES = 10

interface DiaryEditDialogProps {
    summary: DailySummary | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (summaryDate: string, editedContent: string | null, imageUrls: string[], updatedAt: string) => Promise<void>
    canWrite?: boolean
}

export function DiaryEditDialog({ summary, open, onOpenChange, onSave, canWrite = true }: DiaryEditDialogProps) {
    const [content, setContent] = useState("")
    const [pendingImages, setPendingImages] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open && summary) {
            setContent(summary.edited_content ?? summary.generated_content)
            setPendingImages(summary.image_urls ?? [])
            setUploadError(null)
            setSaveError(null)
        }
    }, [open, summary])

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        if (files.length === 0) return

        // ファイル形式チェック
        const nonImages = files.filter((f) => !f.type.startsWith("image/"))
        if (nonImages.length > 0) {
            setUploadError("画像ファイルを選択してください")
            e.target.value = ""
            return
        }

        // 枚数上限チェック
        if (pendingImages.length + files.length > MAX_IMAGES) {
            setUploadError(`写真は最大 ${MAX_IMAGES} 枚まで添付できます`)
            e.target.value = ""
            return
        }

        setUploadError(null)
        setIsUploading(true)

        try {
            const uploadPromises = files.map(async (file) => {
                const compressed = await compressImage(file)
                return await uploadImage(compressed)
            })
            const newUrls = await Promise.all(uploadPromises)
            setPendingImages((prev) => [...prev, ...newUrls])
        } catch (err) {
            if (err instanceof ImageTooLargeError) {
                setUploadError(err.message)
            } else if (err instanceof Error) {
                setUploadError(err.message)
            } else {
                setUploadError("写真のアップロードに失敗しました。再度お試しください")
            }
        } finally {
            setIsUploading(false)
            e.target.value = ""
        }
    }

    const handleRemoveImage = (url: string) => {
        setPendingImages((prev) => prev.filter((u) => u !== url))
    }

    const handleSave = async () => {
        if (!summary) return
        setSaving(true)
        setSaveError(null)
        try {
            await onSave(summary.summary_date, content.trim() || null, pendingImages, summary.updated_at)
            onOpenChange(false)
        } catch (error: unknown) {
            const err = error as { response?: { status?: number } };
            if (err?.response?.status === 409) {
                setSaveError("他のユーザーによってデータが更新されました。画面を更新して最新のデータを取得してください。")
            } else {
                setSaveError("保存に失敗しました。時間をおいて再度お試しください。")
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <EditDialogBase
            open={open}
            onOpenChange={onOpenChange}
            title={<span data-sentry-unmask>育児日誌を編集</span>}
        >
            <div className="space-y-4">
                {saveError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                        {saveError}
                    </div>
                )}
                <div>
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        className="resize-none rounded-xl text-sm"
                        placeholder="育児日誌の内容を入力..."
                    />
                    <p className="text-xs text-gray-400 mt-2" data-sentry-unmask>空欄で保存すると AI 生成文に戻ります。</p>
                </div>

                {/* 画像セクション */}
                {canWrite && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">写真（最大 {MAX_IMAGES} 枚）</span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                data-sentry-unmask className="h-8 rounded-xl text-xs gap-1"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || pendingImages.length >= MAX_IMAGES}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <ImagePlus className="h-3.5 w-3.5" />
                                )}
                                写真を追加
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageSelect}
                            />
                        </div>

                        {uploadError && (
                            <p className="text-xs text-red-500">{uploadError}</p>
                        )}

                        {pendingImages.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {pendingImages.map((url) => (
                                    <div key={url} className="relative flex-shrink-0 w-20 h-20">
                                        <Image
                                            src={url}
                                            alt="添付写真"
                                            fill
                                            className="object-cover rounded-lg"
                                            sizes="80px"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(url)}
                                            className="absolute -top-1.5 -right-1.5 bg-gray-700 active:bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                                            aria-label="写真を削除"
                                            title="写真を削除"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
                    <Button
                        variant="outline"
                        data-sentry-unmask onClick={() => onOpenChange(false)}
                        disabled={saving || isUploading}
                        className="rounded-xl"
                    >
                        キャンセル
                    </Button>
                    <Button
                        data-sentry-unmask onClick={handleSave}
                        disabled={isUploading}
                        loading={saving}
                        className="rounded-xl"
                    >
                        保存
                    </Button>
                </div>
            </div>
        </EditDialogBase>
    )
}
