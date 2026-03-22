"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BabyRecord } from "@/types/record"

const RecentActivityFeed = dynamic(
    () => import("@/components/dashboard/RecentActivityFeed").then(m => m.RecentActivityFeed),
    { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-2xl" /> }
)

const JarPhysicsView = dynamic(
    () => import("@/components/dashboard/JarPhysicsView").then(m => m.JarPhysicsView),
    { ssr: false, loading: () => <Skeleton className="h-80 w-full rounded-2xl" /> }
)

interface Props {
    babyId: string
    records?: BabyRecord[]
    isLoading?: boolean
    mutate?: () => void
}

export function RecordViewTabs({ babyId, records, isLoading, mutate }: Props) {
    return (
        <Tabs defaultValue="jar">
            <TabsList className="mb-3 w-full">
                <TabsTrigger value="jar" className="flex-1">瓶</TabsTrigger>
                <TabsTrigger value="list" className="flex-1">リスト</TabsTrigger>
            </TabsList>
            <TabsContent value="jar">
                <JarPhysicsView
                    babyId={babyId}
                    records={records}
                    isLoading={isLoading}
                    mutate={mutate}
                />
            </TabsContent>
            <TabsContent value="list">
                <RecentActivityFeed
                    babyId={babyId}
                    records={records}
                    isLoading={isLoading}
                    mutate={mutate}
                />
            </TabsContent>
        </Tabs>
    )
}
