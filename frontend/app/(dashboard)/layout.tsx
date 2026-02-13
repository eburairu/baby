"use client"
import { useUser } from "@/hooks/useAuth"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { ChevronLeft } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, mutate } = useUser()
    const router = useRouter()
    const pathname = usePathname()

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

    const isRoot = pathname === "/"

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {!isRoot && (
                            <Link href="/">
                                <Button variant="ghost" size="icon" className="mr-1">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                        <Link href="/">
                            <h1 className="text-xl font-bold tracking-tight text-gray-900">Baby App</h1>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden sm:inline-block">
                            Welcome, {user.username}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500">Logout</Button>
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
