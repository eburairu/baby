import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
    children: React.ReactNode
}

export function StatsCard({ children }: StatsCardProps) {
    return (
        <Card className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 mb-6 transition-colors">
            <CardContent className="pt-6">
                {children}
            </CardContent>
        </Card>
    )
}
