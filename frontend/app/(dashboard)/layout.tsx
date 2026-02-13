"use client"
import { useUser } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, mutate } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [isLoading, user, router])

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>

    if (!user) return null

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout", {})
            await mutate() // clear user state
            router.push("/login")
        } catch (e) {
            console.error("Logout failed", e)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Baby App</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden sm:inline-block">
                            Welcome, {user.username}
                        </span>
                        <Button variant="outline" onClick={handleLogout}>Logout</Button>
                    </div>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
