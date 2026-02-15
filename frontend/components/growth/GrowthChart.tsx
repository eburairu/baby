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

interface GrowthChartProps {
    records: Growth[]
    babyBirthday?: string | null
    babyGender?: string | null
}

export function GrowthChart({ records, babyBirthday, babyGender }: GrowthChartProps) {
    const [showWho, setShowWho] = useState(true)

    const chartData = useMemo(() => {
        // Prepare WHO data
        const whoData = (babyBirthday && babyGender && showWho)
            ? generateWhoSeries(babyBirthday, babyGender, 'height') // type is ignored in generateWho for generic month structure if optimization needed, but current util generates one type. 
            // Wait, generateWhoSeries takes type. We need to generate for ALL types or generate on demand.
            // Let's modify generateWhoSeries usage or run it for each tab content?
            // Actually, mergeData is specific to type.
            : []

        // We'll generate merged data for each type in the render or here.
        // It's better to memoize.

        return {
            height: mergeData(records, babyBirthday && babyGender && showWho ? generateWhoSeries(babyBirthday, babyGender, 'height') : [], 'height'),
            weight: mergeData(records, babyBirthday && babyGender && showWho ? generateWhoSeries(babyBirthday, babyGender, 'weight') : [], 'weight'),
            head: mergeData(records, babyBirthday && babyGender && showWho ? generateWhoSeries(babyBirthday, babyGender, 'head') : [], 'head'),
        }
    }, [records, babyBirthday, babyGender, showWho])

    if (records.length === 0 && !babyBirthday) {
        return (
            <Card className="w-full">
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
    const tooltipFormatter = (value: number, name: string) => {
        if (name.includes("WHO")) return [value.toFixed(1), name];
        return [value, name];
    }

    const renderChart = (data: any[], dataKey: string, unit: string, color: string) => (
        <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={formatDateTick}
                        type="number"
                        scale="time"
                    />
                    <YAxis unit={unit} domain={['auto', 'auto']} />
                    <Tooltip labelFormatter={(label) => format(new Date(label), "yyyy/MM/dd")} formatter={tooltipFormatter as any} />
                    <Legend />

                    {/* WHO Areas */}
                    {showWho && (
                        <>
                            <Area type="monotone" dataKey={`who_${dataKey}_p97`} stroke="none" fill="#e0e0e0" fillOpacity={0.3} connectNulls stackId="who" />
                            <Line type="monotone" dataKey={`who_${dataKey}_p97`} stroke="#ccc" strokeDasharray="5 5" dot={false} name="WHO P97" connectNulls />
                            <Line type="monotone" dataKey={`who_${dataKey}_p50`} stroke="#999" strokeWidth={2} dot={false} name="WHO P50" connectNulls />
                            <Line type="monotone" dataKey={`who_${dataKey}_p3`} stroke="#ccc" strokeDasharray="5 5" dot={false} name="WHO P3" connectNulls />
                        </>
                    )}

                    {/* User Data */}
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        name="記録"
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">成長曲線</CardTitle>
                {(babyBirthday && babyGender) && (
                    <div className="flex items-center space-x-2">
                        <Checkbox id="show-who" checked={showWho} onCheckedChange={(c: boolean | 'indeterminate') => setShowWho(!!c)} />
                        <Label htmlFor="show-who" className="text-sm">WHO基準を表示</Label>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="weight" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="height">身長</TabsTrigger>
                        <TabsTrigger value="weight">体重</TabsTrigger>
                        <TabsTrigger value="head">頭囲</TabsTrigger>
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
