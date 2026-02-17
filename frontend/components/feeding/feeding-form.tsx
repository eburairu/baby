"use client"

import { useState, useEffect } from "react"
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
import { FeedingCreate, FeedingType } from "@/types/feeding"

const feedingSchema = z.object({
    feeding_time: z.string(),
    feeding_type: z.enum(["BREAST", "BOTTLE"]),
    duration_minutes: z.coerce.number().optional(),
    amount_ml: z.coerce.number().optional(),
    notes: z.string().optional(),
})

type FeedingFormValues = z.infer<typeof feedingSchema>

interface FeedingFormProps {
    babyId: number
    onAdd: (data: FeedingCreate) => Promise<void>
}

export function FeedingForm({ babyId, onAdd }: FeedingFormProps) {
    const [activeTab, setActiveTab] = useState<FeedingType>("BREAST")
    const [timerRunning, setTimerRunning] = useState(false)
    const [timerSeconds, setTimerSeconds] = useState(0)
    const [baseTime, setBaseTime] = useState<number | null>(null)

    const form = useForm<FeedingFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(feedingSchema) as any,
        defaultValues: {
            feeding_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            feeding_type: "BREAST",
            duration_minutes: 0,
            amount_ml: 120,
            notes: "",
        },
    })

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timerRunning) {
            // baseTime is set in toggleTimer now to avoid effect dependency issues
            interval = setInterval(() => {
                if (baseTime) {
                    const diff = Math.floor((Date.now() - baseTime) / 1000)
                    setTimerSeconds(diff)
                }
            }, 1000)
        } else {
            // cleanup is handled in toggleTimer/resetTimer
        }
        return () => clearInterval(interval)
    }, [timerRunning, baseTime])

    useEffect(() => {
        // Update duration field when timer updates
        if (timerSeconds > 0) {
            const minutes = Math.ceil(timerSeconds / 60)
            form.setValue("duration_minutes", minutes)
        }
    }, [timerSeconds, form])

    const toggleTimer = () => {
        if (!timerRunning) {
            // Start
            if (baseTime === null) setBaseTime(Date.now() - timerSeconds * 1000)
        } else {
            // Stop (optional logic if needed)
        }
        setTimerRunning(prev => !prev)
    }

    const resetTimer = () => {
        setTimerRunning(false)
        setTimerSeconds(0)
        setBaseTime(null)
        form.setValue("duration_minutes", 0)
    }

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const onSubmit = async (values: z.infer<typeof feedingSchema>) => {
        const data: FeedingCreate = {
            ...values,
            baby_id: babyId,
            feeding_type: activeTab,
        }

        // Clean up data based on type
        if (activeTab === "BREAST") {
            data.amount_ml = undefined
        } else {
            data.duration_minutes = undefined
        }

        await onAdd(data)

        // Reset form
        form.reset({
            feeding_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            feeding_type: activeTab as "BREAST" | "BOTTLE",
            duration_minutes: 0,
            amount_ml: 120,
            notes: "",
        })
        resetTimer()
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeedingType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="BREAST">🤱 母乳</TabsTrigger>
                        <TabsTrigger value="BOTTLE">🍼 ミルク</TabsTrigger>
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
                                {/* Timer Section */}
                                <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-lg text-center space-y-3 transition-colors">
                                    <div className="text-4xl font-mono font-bold text-rose-600 dark:text-rose-400">
                                        {formatTimer(timerSeconds)}
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            type="button"
                                            size="lg"
                                            variant={timerRunning ? "outline" : "default"}
                                            className={timerRunning 
                                                ? "bg-white dark:bg-zinc-900 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50" 
                                                : "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white"}
                                            onClick={toggleTimer}
                                        >
                                            {timerRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                                            {timerRunning ? "一時停止" : "スタート"}
                                        </Button>
                                        <Button type="button" variant="ghost" size="lg" onClick={resetTimer}>
                                            <RotateCcw className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
                                        </Button>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="duration_minutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>授乳時間 (分)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="BOTTLE" className="space-y-4 mt-0">
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

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>メモ</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="例: 右のみ、飲みむらあり" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
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
