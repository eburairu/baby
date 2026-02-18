"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Play, Pause, RotateCcw, Save } from "lucide-react"

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
import { FeedingCreate, FeedingType, BreastSide, BottleContentType, FeedingCompletion } from "@/types/feeding"

const feedingSchema = z.object({
    feeding_time: z.string(),
    feeding_type: z.enum(["BREAST", "BOTTLE"]),
    left_breast_minutes: z.coerce.number().min(0).optional(),
    right_breast_minutes: z.coerce.number().min(0).optional(),
    amount_ml: z.coerce.number().optional(),
    notes: z.string().optional(),
})

type FeedingFormValues = z.infer<typeof feedingSchema>

interface FeedingFormProps {
    babyId: number
    onAdd: (data: FeedingCreate) => Promise<void>
}

type ActiveBreastSide = "LEFT" | "RIGHT" | null

export function FeedingForm({ babyId, onAdd }: FeedingFormProps) {
    const [activeTab, setActiveTab] = useState<FeedingType>("BREAST")

    // 左右独立タイマー
    const [leftSeconds, setLeftSeconds] = useState(0)
    const [rightSeconds, setRightSeconds] = useState(0)
    const [activeBreastSide, setActiveBreastSide] = useState<ActiveBreastSide>(null)
    const leftBaseRef = useRef<number | null>(null)
    const rightBaseRef = useRef<number | null>(null)

    // Phase 2: ボトルコンテンツタイプ・授乳完全度
    const [bottleContentType, setBottleContentType] = useState<BottleContentType | null>(null)
    const [feedingCompletion, setFeedingCompletion] = useState<FeedingCompletion | null>(null)

    const form = useForm<FeedingFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(feedingSchema) as any,
        defaultValues: {
            feeding_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            feeding_type: "BREAST",
            left_breast_minutes: 0,
            right_breast_minutes: 0,
            amount_ml: 120,
            notes: "",
        },
    })

    // タイマーインターバル
    useEffect(() => {
        if (activeBreastSide === null) return
        const interval = setInterval(() => {
            const now = Date.now()
            if (activeBreastSide === "LEFT" && leftBaseRef.current !== null) {
                const diff = Math.floor((now - leftBaseRef.current) / 1000)
                setLeftSeconds(diff)
                form.setValue("left_breast_minutes", Math.ceil(diff / 60))
            } else if (activeBreastSide === "RIGHT" && rightBaseRef.current !== null) {
                const diff = Math.floor((now - rightBaseRef.current) / 1000)
                setRightSeconds(diff)
                form.setValue("right_breast_minutes", Math.ceil(diff / 60))
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [activeBreastSide, form])

    const startTimer = (side: "LEFT" | "RIGHT") => {
        // 反対側が動いていれば停止
        if (side === "LEFT" && activeBreastSide === "RIGHT") {
            rightBaseRef.current = null
        } else if (side === "RIGHT" && activeBreastSide === "LEFT") {
            leftBaseRef.current = null
        }

        if (side === "LEFT") {
            leftBaseRef.current = Date.now() - leftSeconds * 1000
        } else {
            rightBaseRef.current = Date.now() - rightSeconds * 1000
        }
        setActiveBreastSide(side)
    }

    const stopTimer = () => {
        setActiveBreastSide(null)
    }

    const toggleTimer = (side: "LEFT" | "RIGHT") => {
        if (activeBreastSide === side) {
            stopTimer()
        } else {
            startTimer(side)
        }
    }

    const resetAllTimers = () => {
        setActiveBreastSide(null)
        leftBaseRef.current = null
        rightBaseRef.current = null
        setLeftSeconds(0)
        setRightSeconds(0)
        form.setValue("left_breast_minutes", 0)
        form.setValue("right_breast_minutes", 0)
    }

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const totalSeconds = leftSeconds + rightSeconds

    const onSubmit = async (values: FeedingFormValues) => {
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
            notes: values.notes || undefined,
            feeding_completion: feedingCompletion ?? undefined,
        }

        if (activeTab === "BREAST") {
            data.left_breast_minutes = leftMin || undefined
            data.right_breast_minutes = rightMin || undefined
            data.last_breast_side = lastBreastSide
            // duration_minutesはバックエンドが自動計算（両方指定時）
            // 片方のみの場合はフロント側で設定
            if (leftMin > 0 && rightMin > 0) {
                // バックエンドが自動計算
            } else {
                data.duration_minutes = leftMin + rightMin || undefined
            }
        } else {
            data.amount_ml = values.amount_ml
            data.bottle_content_type = bottleContentType ?? undefined
        }

        await onAdd(data)

        // Reset
        form.reset({
            feeding_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            feeding_type: activeTab as "BREAST" | "BOTTLE",
            left_breast_minutes: 0,
            right_breast_minutes: 0,
            amount_ml: 120,
            notes: "",
        })
        resetAllTimers()
        setFeedingCompletion(null)
        setBottleContentType(null)
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeedingType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="BREAST" data-sentry-unmask>🤱 母乳</TabsTrigger>
                        <TabsTrigger value="BOTTLE" data-sentry-unmask>🍼 ミルク</TabsTrigger>
                    </TabsList>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

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
                                {/* 左右タイマーセクション */}
                                <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-lg space-y-3 transition-colors">
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* 左乳タイマー */}
                                        <div className="text-center space-y-2">
                                            <p className="text-xs font-medium text-rose-700 dark:text-rose-300">左乳</p>
                                            <div className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400">
                                                {formatTimer(leftSeconds)}
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={activeBreastSide === "LEFT" ? "outline" : "default"}
                                                className={activeBreastSide === "LEFT"
                                                    ? "w-full bg-white dark:bg-zinc-900 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                                    : "w-full bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white"}
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
                                            <p className="text-xs font-medium text-rose-700 dark:text-rose-300">右乳</p>
                                            <div className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400">
                                                {formatTimer(rightSeconds)}
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={activeBreastSide === "RIGHT" ? "outline" : "default"}
                                                className={activeBreastSide === "RIGHT"
                                                    ? "w-full bg-white dark:bg-zinc-900 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                                    : "w-full bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white"}
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
                                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                                            合計: {formatTimer(totalSeconds)}
                                        </p>
                                        <Button type="button" variant="ghost" size="sm" onClick={resetAllTimers} className="h-7 text-xs">
                                            <RotateCcw className="h-3 w-3 mr-1 text-gray-500 dark:text-zinc-400" />
                                            リセット
                                        </Button>
                                    </div>
                                </div>

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
                                                className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors
                                                    ${bottleContentType === value
                                                        ? "bg-blue-500 text-white border-blue-500"
                                                        : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-blue-300"
                                                    }`}
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
                                            className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors
                                                ${feedingCompletion === value
                                                    ? value === "FULL"
                                                        ? "bg-green-500 text-white border-green-500"
                                                        : "bg-amber-500 text-white border-amber-500"
                                                    : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-gray-300"
                                                }`}
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

                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" data-sentry-unmask>
                                <Save className="w-4 h-4 mr-2" />
                                記録する
                            </Button>
                        </form>
                    </Form>
                </Tabs>
            </CardContent>
        </Card>
    )
}
