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
    Brush,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import type { Growth } from "@/types/growth"
import { generateWhoSeries, mergeData } from "@/lib/growthUtils"
import { useMemo, useState } from "react"
import { subMonths, subDays } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import { formatMonthDay, formatDate } from "@/lib/dateUtils"

interface GrowthChartProps {
    records: Growth[]
    babyBirthday?: string | null
    babyGender?: string | null
}

interface ChartDataPoint {
    date: number;
    [key: string]: number | string | undefined;
}

export function GrowthChart({ records, babyBirthday, babyGender }: GrowthChartProps) {
    const [showWho, setShowWho] = useState(true)
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    // Zoom and domain state
    const [left, setLeft] = useState<number | "dataMin" | undefined>(undefined)
    const [right, setRight] = useState<number | "dataMax" | undefined>(undefined)

    const chartData = useMemo(() => {
        return {
            height: mergeData(records, babyBirthday && babyGender && showWho ? generateWhoSeries(babyBirthday, babyGender, "height") : [], "height") as ChartDataPoint[],
            weight: mergeData(records, babyBirthday && babyGender && showWho ? generateWhoSeries(babyBirthday, babyGender, "weight") : [], "weight") as ChartDataPoint[],
            head: mergeData(records, babyBirthday && babyGender && showWho ? generateWhoSeries(babyBirthday, babyGender, "head") : [], "head") as ChartDataPoint[],
        }
    }, [records, babyBirthday, babyGender, showWho])

    const defaultRange = useMemo(() => {
        if (records.length === 0) return { left: "dataMin" as const, right: "dataMax" as const };
        const latestDate = new Date(Math.max(...records.map(r => new Date(r.date).getTime())));
        const sevenDaysAgo = subDays(latestDate, 7).getTime();
        const firstRecordDate = new Date(Math.min(...records.map(r => new Date(r.date).getTime()))).getTime();
        return {
            left: Math.max(sevenDaysAgo, firstRecordDate),
            right: latestDate.getTime()
        };
    }, [records]);

    const currentLeft = left !== undefined ? left : defaultRange.left;
    const currentRight = right !== undefined ? right : defaultRange.right;

    const handleQuickRange = (range: number | "all" | "7days") => {
        if (records.length === 0) return;
        
        const latestDate = new Date(Math.max(...records.map(r => new Date(r.date).getTime())));
        if (range === "all") {
            setLeft("dataMin");
            setRight("dataMax");
        } else if (range === "7days") {
            const startDate = subDays(latestDate, 7).getTime();
            const firstRecordDate = new Date(Math.min(...records.map(r => new Date(r.date).getTime()))).getTime();
            setLeft(Math.max(startDate, firstRecordDate));
            setRight(latestDate.getTime());
        } else {
            const startDate = subMonths(latestDate, range).getTime();
            const firstRecordDate = new Date(Math.min(...records.map(r => new Date(r.date).getTime()))).getTime();
            setLeft(Math.max(startDate, firstRecordDate));
            setRight(latestDate.getTime());
        }
    }

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
        return formatMonthDay(timestamp)
    }

    // Tooltip formatter
    const tooltipFormatter = (value: unknown, name: string | undefined) => {
        const displayName = name || "";
        if (value === undefined || value === null) return ["-", displayName];
        const numValue = typeof value === "string" ? parseFloat(value) : (value as number);
        if (displayName.includes("WHO")) return [numValue.toFixed(1), displayName];
        return [numValue, displayName];
    }

    const gridColor = isDark ? "#27272a" : "#e5e7eb" // zinc-800 : gray-200
    const textColor = isDark ? "#a1a1aa" : "#6b7280" // zinc-400 : gray-500
    const whoLineColor = isDark ? "#3f3f46" : "#ccc" // zinc-700 : ccc
    const whoFillColor = isDark ? "#18181b" : "#e0e0e0" // zinc-900 : e0e0e0
    const emeraldColor = "#10b981" // emerald-500

    const renderChart = (data: ChartDataPoint[], dataKey: string, unit: string, color: string) => (
        <div style={{ width: "100%", height: "400px" }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="date"
                        domain={[currentLeft, currentRight]}
                        tickFormatter={formatDateTick}
                        type="number"
                        scale="time"
                        allowDataOverflow
                        tick={{ fill: textColor, fontSize: 10 }}
                    />
                    <YAxis unit={unit} domain={["auto", "auto"]} tick={{ fill: textColor, fontSize: 10 }} />
                    <Tooltip 
                        labelFormatter={(label) => formatDate(label)}
                        formatter={tooltipFormatter}
                        contentStyle={{ 
                            backgroundColor: isDark ? "#18181b" : "#fff", 
                            borderColor: isDark ? "#27272a" : "#e5e7eb",
                            color: isDark ? "#f4f4f5" : "#1f2937"
                        }}
                        itemStyle={{ color: isDark ? "#f4f4f5" : "#1f2937" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "10px" }} />

                    {/* WHO Areas */}
                    {showWho ? (
                        <>
                            <Area type="monotone" dataKey={`who_${dataKey}_p97`} stroke="none" fill={whoFillColor} fillOpacity={0.4} connectNulls stackId="who" legendType="none" />
                            <Line type="monotone" dataKey={`who_${dataKey}_p97`} stroke={whoLineColor} strokeDasharray="5 5" dot={false} name="WHO P97" connectNulls />
                            <Line type="monotone" dataKey={`who_${dataKey}_p50`} stroke={isDark ? "#71717a" : "#999"} strokeWidth={2} dot={false} name="WHO P50" connectNulls />
                            <Line type="monotone" dataKey={`who_${dataKey}_p3`} stroke={whoLineColor} strokeDasharray="5 5" dot={false} name="WHO P3" connectNulls />
                        </>
                    ) : null}

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

                    <Brush
                        dataKey="date"
                        height={30}
                        stroke={emeraldColor}
                        fill={isDark ? "#18181b" : "#fff"}
                        tickFormatter={formatDateTick}
                        onChange={(obj) => {
                            if (obj && obj.startIndex !== undefined && obj.endIndex !== undefined) {
                                const startData = data[obj.startIndex];
                                const endData = data[obj.endIndex];
                                if (startData && endData) {
                                    setLeft(startData.date);
                                    setRight(endData.date);
                                }
                            }
                        }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )

    return (
        <Card className="w-full dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
            <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <CardTitle className="text-lg dark:text-zinc-100">成長曲線</CardTitle>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleQuickRange("7days")}>7日</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleQuickRange(1)}>1ヶ月</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleQuickRange(6)}>6ヶ月</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleQuickRange(12)}>1年</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleQuickRange("all")}>全期間</Button>
                    </div>
                    {(babyBirthday && babyGender) ? (
                        <div className="flex items-center space-x-2">
                            <Checkbox id="show-who" checked={showWho} onCheckedChange={(c: boolean | "indeterminate") => setShowWho(!!c)} />
                            <Label htmlFor="show-who" className="text-sm dark:text-zinc-300">WHO基準</Label>
                        </div>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="weight" className="w-full">
                    <TabsList className="mb-4 dark:bg-zinc-800">
                        <TabsTrigger value="height" className="dark:data-[state=active]:bg-zinc-700 dark:text-zinc-400 dark:data-[state=active]:text-zinc-100 font-medium">身長</TabsTrigger>
                        <TabsTrigger value="weight" className="dark:data-[state=active]:bg-zinc-700 dark:text-zinc-400 dark:data-[state=active]:text-zinc-100 font-medium">体重</TabsTrigger>
                        <TabsTrigger value="head" className="dark:data-[state=active]:bg-zinc-700 dark:text-zinc-400 dark:data-[state=active]:text-zinc-100 font-medium">頭囲</TabsTrigger>
                    </TabsList>

                    <TabsContent value="height" className="h-[420px]">
                        {renderChart(chartData.height, "height", "cm", "#8884d8")}
                    </TabsContent>

                    <TabsContent value="weight" className="h-[420px]">
                        {renderChart(chartData.weight, "weight", "kg", "#10b981")}
                    </TabsContent>

                    <TabsContent value="head" className="h-[420px]">
                        {renderChart(chartData.head, "head", "cm", "#f59e0b")}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
