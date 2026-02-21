"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useAuth"
import { LandingContent } from "@/components/landing/LandingContent"

export default function LandingPage() {
    const { user, isLoading } = useUser()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && !isLoading && user) {
            router.push("/dashboard")
        }
    }, [mounted, isLoading, user, router])

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-100 rounded-full" />
                    <div className="h-4 w-24 bg-indigo-50 rounded" />
                </div>
            </div>
        )
    }

    return <LandingContent />
}
