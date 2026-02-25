import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface StaticPageLayoutProps {
    children: React.ReactNode
}

export function StaticPageLayout({ children }: StaticPageLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4">
            <div className="max-w-3xl mx-auto space-y-12">
                <Link href="/">
                    <Button variant="ghost" className="gap-2 text-slate-600">
                        <ArrowLeft className="h-4 w-4" />
                        トップページに戻る
                    </Button>
                </Link>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm space-y-10 text-slate-900">
                    {children}
                </div>
            </div>
        </div>
    )
}
