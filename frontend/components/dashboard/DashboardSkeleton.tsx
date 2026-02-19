import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Profile Card Skeleton */}
      <Card className="rounded-2xl shadow-sm border-0 dark:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </CardHeader>
      </Card>

      {/* Widgets Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-sm border-0 dark:bg-zinc-900">
            <CardContent className="p-4 flex flex-col items-center justify-center space-y-2 min-h-[100px]">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diary Link Skeleton */}
      <Skeleton className="h-12 w-full rounded-2xl" />

      {/* Activity Feed Skeleton */}
      <Card className="rounded-2xl shadow-sm border-0 dark:bg-zinc-900">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
