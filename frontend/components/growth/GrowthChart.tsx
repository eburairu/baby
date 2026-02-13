"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GrowthChartProps {
    records: any[]
}

export function GrowthChart({ records }: GrowthChartProps) {
    // 昇順にソート (Recharts用)
    const sortedRecords = [...records].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    if (records.length === 0) {
        return (
            <Card className="w-full">
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                    グラフを表示するためのデータがありません
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg">成長曲線</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="weight" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="height">身長</TabsTrigger>
                        <TabsTrigger value="weight">体重</TabsTrigger>
                        <TabsTrigger value="head">頭囲</TabsTrigger>
                    </TabsList>

                    <TabsContent value="height" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sortedRecords}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis unit="cm" fontSize={12} domain={['auto', 'auto']} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="height"
                                    name="身長"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="weight" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sortedRecords}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis unit="g" fontSize={12} domain={['auto', 'auto']} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    name="体重"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="head" className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sortedRecords}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis unit="cm" fontSize={12} domain={['auto', 'auto']} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="head_circumference"
                                    name="頭囲"
                                    stroke="#ff7300"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    connectNulls
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
