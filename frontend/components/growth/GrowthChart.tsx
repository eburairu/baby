import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Growth } from "@/types/growth"
import { generateWhoSeries, mergeData } from "@/utils/growthUtils"
import { useMemo } from "react"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useTheme } from "next-themes"

interface GrowthChartProps {
    records: Growth[]
    babyBirthday?: string | null
    babyGender?: string | null
}

export function GrowthChart({ records, babyBirthday, babyGender }: GrowthChartProps) {
    const [showWho, setShowWho] = useState(true)
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const chartData = useMemo(() => {
        // Prepare WHO data
        const whoData = (babyBirthday && babyGender && showWho)
            ? generateWhoSeries(babyBirthday, babyGender, 'height') 
            : []

        return {
            height: mergeData(records, babyBirthday && babyGender && showWho ? generateWhoSeries(babyBirthday, babyGender, 'height') : [], 'height'),
            weight: mergeData(records, babyBirthday && babyGender && showWho ? generateWhoSeries(babyBirthday, babyGender, 'weight') : [], 'weight'),
            head: mergeData(records, babyBirthday && babyGender && showWho ? generateWhoSeries(babyBirthday, babyGender, 'head') : [], 'head'),
        }
    }, [records, babyBirthday, babyGender, showWho])

    if (records.length === 0 && !babyBirthday) {
        return (
            <Card className="w-full dark:bg-zinc-900 dark:border-zinc-800">
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                    グラフを表示するためのデータがありません
                </CardContent>
            </Card>
        )
    }

    const formatDateTick = (timestamp: number) => {
        return format(new Date(timestamp), "MM/dd")
    }

    // Tooltip formatter
    const tooltipFormatter = (value: unknown, name: string | undefined) => {
        const displayName = name || "";
        if (value === undefined || value === null) return ["-", displayName];
        const numValue = typeof value === 'string' ? parseFloat(value) : (value as number);
        if (displayName.includes("WHO")) return [numValue.toFixed(1), displayName];
        return [numValue, displayName];
    }

    const gridColor = isDark ? "#27272a" : "#e5e7eb" // zinc-800 : gray-200
    const textColor = isDark ? "#a1a1aa" : "#6b7280" // zinc-400 : gray-500
    const whoLineColor = isDark ? "#3f3f46" : "#ccc" // zinc-700 : ccc
    const whoFillColor = isDark ? "#18181b" : "#e0e0e0" // zinc-900 : e0e0e0

    const renderChart = (data: { date: number; [key: string]: string | number | boolean | Date | null | undefined }[], dataKey: string, unit: string, color: string) => (
        <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="date"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={formatDateTick}
                        type="number"
                        scale="time"
                        tick={{ fill: textColor, fontSize: 10 }}
                    />
                    <YAxis unit={unit} domain={['auto', 'auto']} tick={{ fill: textColor, fontSize: 10 }} />
                    <Tooltip 
                        labelFormatter={(label) => format(new Date(label), "yyyy/MM/dd")} 
                        formatter={tooltipFormatter}
                        contentStyle={{ 
                            backgroundColor: isDark ? "#18181b" : "#fff", 
                            borderColor: isDark ? "#27272a" : "#e5e7eb",
                            color: isDark ? "#f4f4f5" : "#1f2937"
                        }}
                        itemStyle={{ color: isDark ? "#f4f4f5" : "#1f2937" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />

                    {/* WHO Areas */}
                    {showWho && (
                        <>
                            <Area type="monotone" dataKey={`who_${dataKey}_p97`} stroke="none" fill={whoFillColor} fillOpacity={0.4} connectNulls stackId="who" />
                            <Line type="monotone" dataKey={`who_${dataKey}_p97`} stroke={whoLineColor} strokeDasharray="5 5" dot={false} name="WHO P97" connectNulls />
                            <Line type="monotone" dataKey={`who_${dataKey}_p50`} stroke={isDark ? "#71717a" : "#999"} strokeWidth={2} dot={false} name="WHO P50" connectNulls />
                            <Line type="monotone" dataKey={`who_${dataKey}_p3`} stroke={whoLineColor} strokeDasharray="5 5" dot={false} name="WHO P3" connectNulls />
                        </>
                    )}

                    {/* User Data */}
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        name="記録"
                        stroke={color}
                        strokeWidth={3}
                        dot={{ r: 4, fill: color, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        connectNulls
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )

    return (
        <Card className="w-full dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg dark:text-zinc-100">成長曲線</CardTitle>
                {(babyBirthday && babyGender) && (
                    <div className="flex items-center space-x-2">
                        <Checkbox id="show-who" checked={showWho} onCheckedChange={(c: boolean | 'indeterminate') => setShowWho(!!c)} />
                        <Label htmlFor="show-who" className="text-sm dark:text-zinc-300">WHO基準を表示</Label>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="weight" className="w-full">
                    <TabsList className="mb-4 dark:bg-zinc-800">
                        <TabsTrigger value="height" className="dark:data-[state=active]:bg-zinc-700 dark:text-zinc-400 dark:data-[state=active]:text-zinc-100">身長</TabsTrigger>
                        <TabsTrigger value="weight" className="dark:data-[state=active]:bg-zinc-700 dark:text-zinc-400 dark:data-[state=active]:text-zinc-100">体重</TabsTrigger>
                        <TabsTrigger value="head" className="dark:data-[state=active]:bg-zinc-700 dark:text-zinc-400 dark:data-[state=active]:text-zinc-100">頭囲</TabsTrigger>
                    </TabsList>

                    <TabsContent value="height" className="h-[300px]">
                        {renderChart(chartData.height, "height", "cm", "#8884d8")}
                    </TabsContent>

                    <TabsContent value="weight" className="h-[300px]">
                        {renderChart(chartData.weight, "weight", "kg", "#82ca9d")}
                    </TabsContent>

                    <TabsContent value="head" className="h-[300px]">
                        {renderChart(chartData.head, "head", "cm", "#ff7300")}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
