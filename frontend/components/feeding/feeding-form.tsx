"use client"

import { useState, useEffect, useCallback } from "react"
import { useFeedingTimer } from "@/hooks/useFeedingTimer"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Play, Pause, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { UI_COLORS, UI_BUTTONS, UI_FORMS } from "@/constants/ui-colors"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Feeding, FeedingCreate, FeedingUpdate, FeedingType, BreastSide, BottleContentType, FeedingCompletion } from "@/types/feeding"

const feedingSchema = z.object({
    feeding_time: z.string(),
    feeding_type: z.enum(["BREAST", "BOTTLE", "MIXED"]),
    left_breast_minutes: z.coerce.number().min(0).optional(),
    right_breast_minutes: z.coerce.number().min(0).optional(),
    amount_ml: z.coerce.number().optional(),
    notes: z.string().optional(),
})

type FeedingFormValues = z.infer<typeof feedingSchema>

interface FeedingFormProps {
    babyId: number
    onAdd?: (data: FeedingCreate) => Promise<void>
    onUpdate?: (id: number, data: FeedingUpdate) => Promise<Feeding | undefined>
    initialData?: Feeding
    onSuccess?: () => void
    lastMilkAmount?: number | null
}

export function FeedingForm({ babyId, onAdd, onUpdate, initialData, onSuccess, lastMilkAmount }: FeedingFormProps) {
    const isEditing = !!initialData
    const [activeTab, setActiveTab] = useState<FeedingType>(initialData?.feeding_type ?? "BREAST")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 左右独立タイマー (Hooks)
    const {
        leftSeconds,
        rightSeconds,
        setLeftSeconds,
        setRightSeconds,
        activeBreastSide,
        toggleTimer,
        resetAllTimers,
        formatTimer,
        totalSeconds
    } = useFeedingTimer({
        initialLeftMinutes: initialData?.left_breast_minutes ?? 0,
        initialRightMinutes: initialData?.right_breast_minutes ?? 0
    })

    // Phase 2: ボトルコンテンツタイプ・授乳完全度
    const [bottleContentType, setBottleContentType] = useState<BottleContentType | null>(initialData?.bottle_content_type ?? null)
    const [feedingCompletion, setFeedingCompletion] = useState<FeedingCompletion | null>(initialData?.feeding_completion ?? null)

    const form = useForm<FeedingFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(feedingSchema) as any,
        defaultValues: {
            feeding_time: initialData 
                ? format(new Date(initialData.feeding_time), "yyyy-MM-dd'T'HH:mm")
                : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            feeding_type: initialData?.feeding_type ?? "BREAST",
            left_breast_minutes: initialData?.left_breast_minutes ?? 0,
            right_breast_minutes: initialData?.right_breast_minutes ?? 0,
            amount_ml: initialData?.amount_ml ?? lastMilkAmount ?? 120,
            notes: initialData?.notes ?? "",
        },
    })

    // タイマーの値をフォームと同期
    useEffect(() => {
        form.setValue("left_breast_minutes", Math.ceil(leftSeconds / 60))
    }, [leftSeconds, form])

    useEffect(() => {
        form.setValue("right_breast_minutes", Math.ceil(rightSeconds / 60))
    }, [rightSeconds, form])

    // 前回のミルク量をデフォルトとしてセット (SWRで後から読み込まれた場合)
    useEffect(() => {
        if (!isEditing && lastMilkAmount && form.getValues("amount_ml") === 120) {
            form.setValue("amount_ml", lastMilkAmount)
        }
    }, [lastMilkAmount, isEditing, form])

    const onSubmit = useCallback(async (values: FeedingFormValues) => {
        setIsSubmitting(true)
        try {
            const leftMin = values.left_breast_minutes || 0
            const rightMin = values.right_breast_minutes || 0

            // 最終授乳側を判定
            let lastBreastSide: BreastSide | undefined
            if (activeTab === "BREAST") {
                if (leftMin > 0 && rightMin > 0) lastBreastSide = "BOTH"
                else if (leftMin > 0) lastBreastSide = "LEFT"
                else if (rightMin > 0) lastBreastSide = "RIGHT"
            }

            const data: FeedingCreate = {
                baby_id: babyId,
                feeding_time: values.feeding_time,
                feeding_type: activeTab,
                notes: values.notes || "", // 編集時は明示的に空文字を渡して消去できるようにする
                feeding_completion: feedingCompletion,
            }

            if (activeTab === "BREAST") {
                data.left_breast_minutes = leftMin
                data.right_breast_minutes = rightMin
                data.last_breast_side = lastBreastSide
                data.amount_ml = null
                data.bottle_content_type = null
                // duration_minutesはバックエンドが自動計算（両方指定時）
                if (!(leftMin > 0 && rightMin > 0)) {
                    data.duration_minutes = leftMin + rightMin || 0
                }
            } else {
                data.amount_ml = values.amount_ml
                data.bottle_content_type = bottleContentType
                data.left_breast_minutes = null
                data.right_breast_minutes = null
                data.last_breast_side = null
                data.duration_minutes = null
            }

            if (isEditing && initialData && onUpdate) {
                await onUpdate(initialData.id, data)
                toast.success("更新しました")
            } else if (onAdd) {
                await onAdd(data)
                toast.success("記録しました")
                
                // Reset for new entry only
                form.reset({
                    feeding_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    feeding_type: activeTab as "BREAST" | "BOTTLE",
                    left_breast_minutes: 0,
                    right_breast_minutes: 0,
                    amount_ml: data.amount_ml ?? lastMilkAmount ?? 120,
                    notes: "",
                })
                resetAllTimers()
                setFeedingCompletion(null)
                setBottleContentType(null)
            }
            
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error("Failed to save feeding record:", error)
            toast.error("保存に失敗しました")
        } finally {
            setIsSubmitting(false)
        }
    }, [activeTab, babyId, bottleContentType, feedingCompletion, form, onAdd, onUpdate, isEditing, initialData, resetAllTimers, onSuccess, lastMilkAmount])

    const handleFormSubmit = form.handleSubmit(onSubmit)

    return (
        <Card className={isEditing ? "border-0 shadow-none" : ""}>
            <CardContent className={isEditing ? "p-0" : "pt-6"}>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeedingType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="BREAST" data-sentry-unmask>🤱 母乳</TabsTrigger>
                        <TabsTrigger value="BOTTLE" data-sentry-unmask>🍼 ミルク</TabsTrigger>
                    </TabsList>

                    <Form {...form}>
                        <form onSubmit={handleFormSubmit} className="space-y-4">

                            {/* Common: Time */}
                            <FormField
                                control={form.control}
                                name="feeding_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>日時</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <TabsContent value="BREAST" className="space-y-4 mt-0">
                                {/* 左右タイマーセクション (新規作成時のみ表示) */}
                                {!isEditing && (
                                    <div className={cn(UI_FORMS.timer.rose.container, "p-4 rounded-lg space-y-3 transition-colors")}>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* 左乳タイマー */}
                                            <div className="text-center space-y-2">
                                                <p className={cn("text-xs font-medium", UI_FORMS.timer.rose.title)}>左乳</p>
                                                <div className={cn("text-2xl font-mono font-bold", UI_FORMS.timer.rose.timer)}>
                                                    {formatTimer(leftSeconds)}
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={activeBreastSide === "LEFT" ? "outline" : "default"}
                                                    className={activeBreastSide === "LEFT"
                                                        ? cn("w-full", UI_FORMS.timer.rose.buttonActive)
                                                        : cn("w-full", UI_FORMS.timer.rose.buttonInactive)}
                                                    onClick={() => toggleTimer("LEFT")}
                                                >
                                                    {activeBreastSide === "LEFT"
                                                        ? <><Pause className="mr-1 h-3 w-3" />一時停止</>
                                                        : <><Play className="mr-1 h-3 w-3" />開始</>
                                                    }
                                                </Button>
                                            </div>
                                            {/* 右乳タイマー */}
                                            <div className="text-center space-y-2">
                                                <p className={cn("text-xs font-medium", UI_FORMS.timer.rose.title)}>右乳</p>
                                                <div className={cn("text-2xl font-mono font-bold", UI_FORMS.timer.rose.timer)}>
                                                    {formatTimer(rightSeconds)}
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={activeBreastSide === "RIGHT" ? "outline" : "default"}
                                                    className={activeBreastSide === "RIGHT"
                                                        ? cn("w-full", UI_FORMS.timer.rose.buttonActive)
                                                        : cn("w-full", UI_FORMS.timer.rose.buttonInactive)}
                                                    onClick={() => toggleTimer("RIGHT")}
                                                >
                                                    {activeBreastSide === "RIGHT"
                                                        ? <><Pause className="mr-1 h-3 w-3" />一時停止</>
                                                        : <><Play className="mr-1 h-3 w-3" />開始</>
                                                    }
                                                </Button>
                                            </div>
                                        </div>
                                        {/* 合計表示 & リセット */}
                                        <div className="flex items-center justify-between">
                                            <p className={cn("text-xs font-medium", UI_FORMS.timer.rose.totalText)}>
                                                合計: {formatTimer(totalSeconds)}
                                            </p>
                                            <Button type="button" variant="ghost" size="sm" onClick={resetAllTimers} className="h-7 text-xs">
                                                <RotateCcw className="h-3 w-3 mr-1 text-gray-500 dark:text-zinc-400" />
                                                リセット
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* 左右手動入力 */}
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="left_breast_minutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">左 (分)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} onChange={e => {
                                                        field.onChange(e)
                                                        const val = parseInt(e.target.value) || 0
                                                        setLeftSeconds(val * 60)
                                                    }} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="right_breast_minutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">右 (分)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} onChange={e => {
                                                        field.onChange(e)
                                                        const val = parseInt(e.target.value) || 0
                                                        setRightSeconds(val * 60)
                                                    }} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="BOTTLE" className="space-y-4 mt-0">
                                {/* ボトルコンテンツタイプ */}
                                <div>
                                    <p className="text-sm font-medium mb-2">種類</p>
                                    <div className="flex gap-2">
                                        {([
                                            { value: "FORMULA" as BottleContentType, label: "粉ミルク" },
                                            { value: "EXPRESSED_MILK" as BottleContentType, label: "搾母乳" },
                                            { value: "MIXED" as BottleContentType, label: "混合" },
                                        ] as const).map(({ value, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setBottleContentType(prev => prev === value ? null : value)}
                                                className={cn(
                                                    "flex-1 rounded-lg border py-2 text-xs font-medium transition-colors",
                                                    bottleContentType === value
                                                        ? UI_FORMS.selection.blueSolid.active
                                                        : UI_FORMS.selection.blueSolid.inactive
                                                )}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="amount_ml"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ミルク量 (ml)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            {/* 共通: 授乳完全度 */}
                            <div>
                                <p className="text-sm font-medium mb-2">授乳完全度</p>
                                <div className="flex gap-2">
                                    {([
                                        { value: "FULL" as FeedingCompletion, label: "しっかり飲んだ" },
                                        { value: "PARTIAL" as FeedingCompletion, label: "途中でやめた" },
                                    ] as const).map(({ value, label }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setFeedingCompletion(prev => prev === value ? null : value)}
                                            className={cn(
                                                "flex-1 rounded-lg border py-2 text-xs font-medium transition-colors",
                                                feedingCompletion === value
                                                    ? value === "FULL"
                                                        ? UI_FORMS.selection.greenSolid.active
                                                        : UI_FORMS.selection.amberSolid.active
                                                    : value === "FULL"
                                                        ? UI_FORMS.selection.greenSolid.inactive
                                                        : UI_FORMS.selection.amberSolid.inactive
                                            )}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>メモ</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="例: 飲みむらあり" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className={cn("w-full rounded-xl h-11", UI_BUTTONS.primary)}
                                loading={isSubmitting}
                                data-sentry-unmask
                            >
                                {!isSubmitting && <Save className="w-4 h-4 mr-2" />}
                                {isSubmitting ? "保存中..." : isEditing ? "更新する" : "記録する"}
                            </Button>
                        </form>
                    </Form>
                </Tabs>
            </CardContent>
        </Card>
    )
}
