"use client"

import { useState, useEffect, useCallback } from "react"
import { useFeedingTimer } from "@/hooks/useFeedingTimer"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { feedingSchema, FeedingFormValues } from "@/schemas/feeding"
import { formatDateTimeLocal } from "@/lib/dateUtils"
import { Save, Heart, Milk } from "lucide-react"

import { cn } from "@/lib/utils"
import { UI_BUTTONS } from "@/constants/ui-colors"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Feeding, FeedingCreate, FeedingUpdate, FeedingType, BottleContentType, FeedingCompletion } from "@/types/feeding"
import { buildFeedingPayload } from "@/lib/feedingUtils"
import { useBaseRecordForm } from "@/hooks/useBaseRecordForm"
import { FeedingTimerSection } from "./FeedingTimerSection"
import { BreastFeedingFields } from "./BreastFeedingFields"
import { BottleFeedingFields } from "./BottleFeedingFields"
import { FeedingCompletionSelector } from "./FeedingCompletionSelector"

interface FeedingFormProps {
    babyId: number
    onAdd?: (data: FeedingCreate) => Promise<Feeding | undefined>
    onUpdate?: (id: number, data: FeedingUpdate) => Promise<Feeding | undefined>
    initialData?: Feeding
    onSuccess?: () => void
    lastMilkAmount?: number | null
    lastBottleContentType?: BottleContentType | null
}

export function FeedingForm({ babyId, onAdd, onUpdate, initialData, onSuccess, lastMilkAmount, lastBottleContentType }: FeedingFormProps) {
    const isEditing = !!initialData
    const [activeTab, setActiveTab] = useState<FeedingType>(initialData?.feeding_type ?? "BREAST")

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
    const [feedingCompletion, setFeedingCompletion] = useState<FeedingCompletion | null>(initialData?.feeding_completion ?? null)
    const [burped, setBurped] = useState<boolean | null>(initialData?.burped ?? null)

    const form = useForm<FeedingFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(feedingSchema) as any,
        defaultValues: {
            feeding_time: initialData 
                ? formatDateTimeLocal(initialData.feeding_time)
                : formatDateTimeLocal(new Date()),
            feeding_type: initialData?.feeding_type ?? "BREAST",
            left_breast_minutes: initialData?.left_breast_minutes ?? 0,
            right_breast_minutes: initialData?.right_breast_minutes ?? 0,
            amount_ml: initialData?.amount_ml ?? lastMilkAmount ?? 120,
            bottle_content_type: initialData?.bottle_content_type ?? lastBottleContentType ?? null,
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

    // 前回のミルク量・種類をデフォルトとしてセット (SWRで後から読み込まれた場合)
    useEffect(() => {
        if (!isEditing) {
            if (lastMilkAmount && form.getValues("amount_ml") === 120) {
                form.setValue("amount_ml", lastMilkAmount)
            }
            if (lastBottleContentType && !form.getValues("bottle_content_type")) {
                form.setValue("bottle_content_type", lastBottleContentType)
            }
        }
    }, [lastMilkAmount, lastBottleContentType, isEditing, form])

    const { submitRecord, isSubmitting } = useBaseRecordForm<FeedingFormValues>({
        endpoint: "/feedings/", // Note: This endpoint is actually not used directly when onAdd/onUpdate are provided, but required by type
        babyId,
        onSuccess: (data) => {
            // Reset for new entry only
            if (!isEditing) {
                const res = data as Feeding
                const nextAmount = res?.amount_ml ?? lastMilkAmount ?? 120
                const nextBottleType = res?.bottle_content_type ?? lastBottleContentType ?? null
                
                form.reset({
                    feeding_time: formatDateTimeLocal(new Date()),
                    feeding_type: activeTab as "BREAST" | "BOTTLE",
                    left_breast_minutes: 0,
                    right_breast_minutes: 0,
                    amount_ml: nextAmount,
                    bottle_content_type: nextBottleType,
                    notes: "",
                })
                resetAllTimers()
                setFeedingCompletion(null)
                setBurped(null)
            }
            if (onSuccess) onSuccess()
        },
        successMessage: isEditing ? "更新しました" : "記録しました"
    })

    const onSubmit = useCallback(async (values: FeedingFormValues) => {
        try {
            if (isEditing && initialData && onUpdate) {
                // Update case
                await submitRecord(
                    values,
                    (vals) => buildFeedingPayload({
                        babyId,
                        values: vals,
                        activeTab,
                        feedingCompletion,
                        bottleContentType: vals.bottle_content_type ?? null,
                        burped
                    }),
                    (payload) => onUpdate(initialData.id, payload)
                )
            } else if (onAdd) {
                // Create case with custom onAdd (needed for triggerFeedback etc)
                await submitRecord(
                    values,
                    (vals) => buildFeedingPayload({
                        babyId,
                        values: vals,
                        activeTab,
                        feedingCompletion,
                        bottleContentType: vals.bottle_content_type ?? null,
                        burped
                    }),
                    onAdd
                )
            } else {
                // Default create case (standard POST)
                await submitRecord(values, (vals) => {
                    return buildFeedingPayload({
                        babyId,
                        values: vals,
                        activeTab,
                        feedingCompletion,
                        bottleContentType: vals.bottle_content_type ?? null,
                        burped
                    })
                })
            }
        } catch (error) {
            console.error(error)
            // Error handling is mostly done by the hook, but we catch to avoid unhandled rejections
        }
    }, [activeTab, babyId, burped, feedingCompletion, isEditing, initialData, onAdd, onUpdate, submitRecord])

    const handleFormSubmit = form.handleSubmit(onSubmit)

    return (
        <Card className={isEditing ? "border-0 shadow-none" : ""}>
            <CardContent className={isEditing ? "p-0" : "pt-6"}>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeedingType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="BREAST" data-sentry-unmask><Heart className="w-4 h-4 mr-1" /> 母乳</TabsTrigger>
                        <TabsTrigger value="BOTTLE" data-sentry-unmask><Milk className="w-4 h-4 mr-1" /> ミルク</TabsTrigger>
                    </TabsList>

                    <Form {...form}>
                        <form onSubmit={handleFormSubmit} className="space-y-4">

                            {/* Common: Time */}
                            <FormField
                                control={form.control}
                                name="feeding_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required> 日時</FormLabel>
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
                                    <FeedingTimerSection
                                        leftSeconds={leftSeconds}
                                        rightSeconds={rightSeconds}
                                        activeBreastSide={activeBreastSide}
                                        totalSeconds={totalSeconds}
                                        formatTimer={formatTimer}
                                        toggleTimer={toggleTimer}
                                        resetAllTimers={resetAllTimers}
                                    />
                                )}

                                {/* 左右手動入力 */}
                                <BreastFeedingFields
                                    form={form}
                                    setLeftSeconds={setLeftSeconds}
                                    setRightSeconds={setRightSeconds}
                                />
                            </TabsContent>

                            <TabsContent value="BOTTLE" className="space-y-4 mt-0">
                                <BottleFeedingFields
                                    form={form}
                                />
                            </TabsContent>

                            {/* 共通: 授乳完全度 */}
                            <FeedingCompletionSelector
                                value={feedingCompletion}
                                onChange={setFeedingCompletion}
                            />

                            {/* 共通: ゲップ */}
                            <div className="flex items-center gap-3 py-1">
                                <Checkbox
                                    id="burped"
                                    checked={burped === true}
                                    onCheckedChange={(checked) => setBurped(checked === true ? true : checked === false ? false : null)}
                                />
                                <label
                                    htmlFor="burped"
                                    className="text-sm font-medium leading-none cursor-pointer select-none"
                                >
                                    ゲップできた
                                </label>
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel> メモ</FormLabel>
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
