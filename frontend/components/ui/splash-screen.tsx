"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BabyBottleLoading } from "./baby-bottle-loading"
import { useUser } from "@/hooks/useAuth"
import { useUIVersion } from "@/components/ui-version-provider"
import { cn } from "@/lib/utils"

export function SplashScreen() {
    const { isLoading } = useUser()
    const { isV2 } = useUIVersion()
    const [isVisible, setIsVisible] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true)
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        // マウントとバックグラウンドのローディング完了を待ってフェードアウト
        if (isMounted && !isLoading) {
            const timer = setTimeout(() => {
                setIsVisible(false)
            }, 600) // 余韻を持たせてフェードアウト
            return () => clearTimeout(timer)
        }
    }, [isMounted, isLoading])

    useEffect(() => {
        // ネットワーク障害等でローディングが永久にハングした場合のフォールバック
        const fallback = setTimeout(() => {
            setIsVisible(false)
        }, 5000)
        return () => clearTimeout(fallback)
    }, [])

    if (!isMounted) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <motion.div
                        className="flex flex-col items-center justify-center gap-6"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="relative">
                            <div className={cn(
                                "absolute inset-0 blur-2xl opacity-20 rounded-full animate-pulse",
                                isV2 ? "bg-primary" : "bg-indigo-400"
                            )} />
                            <BabyBottleLoading className={cn(
                                "w-28 h-28 relative z-10",
                                isV2 ? "text-primary" : "text-indigo-500 dark:text-indigo-400"
                            )} />
                        </div>
                        <h1 className={cn(
                            "text-3xl font-extrabold tracking-tight bg-clip-text text-transparent mt-2 drop-shadow-sm font-sans",
                            isV2
                                ? "bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400"
                                : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                        )}>
                            Botoro
                        </h1>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
