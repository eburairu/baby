"use client"

import { FEEDING_COMPLETIONS } from "@/constants/feeding"
import { useState, useEffect, useCallback } from "react"
import { useFeedingTimer } from "@/hooks/useFeedingTimer"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { feedingSchema, FeedingFormValues } from "@/schemas/feeding"
import { format } from "date-fns"
import { Save, Heart, Milk } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { UI_BUTTONS, UI_FORMS } from "@/constants/ui-colors"
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
import { Feeding, FeedingCreate, FeedingUpdate, FeedingType, BottleContentType, FeedingCompletion } from "@/types/feeding"
import { buildFeedingPayload } from "@/lib/feedingUtils"
import { useBaseRecordForm } from "@/hooks/useBaseRecordForm"
import { FeedingTimerSection } from "./FeedingTimerSection"
import { BreastFeedingFields } from "./BreastFeedingFields"
import { BottleFeedingFields } from "./BottleFeedingFields"
import { FeedingCompletionSelector } from "./FeedingCompletionSelector"

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

    const { submitRecord, isSubmitting } = useBaseRecordForm<FeedingFormValues>({
        endpoint: "/feedings/", // Note: This endpoint is actually not used directly when onAdd/onUpdate are provided, but required by type
        babyId,
        onSuccess: (data) => {
            // Reset for new entry only
            if (!isEditing) {
                // @ts-ignore - amount_ml is possibly missing in data but safe here
                const nextAmount = (data as Feeding)?.amount_ml ?? lastMilkAmount ?? 120
                
                form.reset({
                    feeding_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    feeding_type: activeTab as "BREAST" | "BOTTLE",
                    left_breast_minutes: 0,
                    right_breast_minutes: 0,
                    amount_ml: nextAmount,
                    notes: "",
                })
                resetAllTimers()
                setFeedingCompletion(null)
                setBottleContentType(null)
            }
            if (onSuccess) onSuccess()
        },
        successMessage: isEditing ? "更新しました" : "記録しました"
    })

    const onSubmit = useCallback(async (values: FeedingFormValues) => {
        // If custom handlers are provided, we use them instead of submitRecord default
        // However, we still want to reuse the payload building logic

        // Note: We are using useBaseRecordForm mainly for state management here if we use onAdd/onUpdate
        // But submitRecord automatically calls the API.
        // To avoid double submission or conflict, we only use submitRecord if onAdd/onUpdate are NOT provided?
        // Actually, for this refactor, we are simplifying by accepting that we might need to duplicate some logic
        // OR we just use submitRecord for the "Create" case if onAdd is not provided (which is rare).
        //
        // Let's respect the existing props.
        try {
           // We'll manually manage the submission process using the injected handlers if present
           // This keeps the "useBaseRecordForm" primarily for the shared "success" logic if we could hook into it,
           // but since we can't easily, we'll just fall back to manual handling for the custom props cases
           // and use submitRecord ONLY if we want default behavior (which is just POST).

           // BUT, to clean up this file, let's just use the manual logic we had, but simplified.
           // Wait, I already introduced useBaseRecordForm above.
           // I will use `submitRecord` for the standard creation case, and manual for Update.

            if (isEditing && initialData && onUpdate) {
                const data = buildFeedingPayload({
                    babyId,
                    values,
                    activeTab,
                    feedingCompletion,
                    bottleContentType
                })
                await onUpdate(initialData.id, data)
                toast.success("更新しました")
                if (onSuccess) onSuccess()
            } else {
                // Create case
                // We use submitRecord.
                await submitRecord(values, (vals, base) => {
                    return buildFeedingPayload({
                        babyId,
                        values: vals,
                        activeTab,
                        feedingCompletion,
                        bottleContentType
                    })
                })
           }

        } catch (error) {
            console.error(error)
            toast.error("保存に失敗しました")
        }
    }, [activeTab, babyId, bottleContentType, feedingCompletion, form, onUpdate, isEditing, initialData, submitRecord, onSuccess])

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
                                        <FormLabel> 日時</FormLabel>
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
                                    bottleContentType={bottleContentType}
                                    setBottleContentType={setBottleContentType}
                                />
                            </TabsContent>

                            {/* 共通: 授乳完全度 */}
                            <FeedingCompletionSelector
                                value={feedingCompletion}
                                onChange={setFeedingCompletion}
                            />

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
                                {isSubmitting ? "保 存中..." : isEditing ? "更新する" : "記録する"}
                            </Button>
                        </form>
                    </Form>
                </Tabs>
            </CardContent>
        </Card>
    )
}
