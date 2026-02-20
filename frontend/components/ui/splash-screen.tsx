"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BabyBottleLoading } from "./baby-bottle-loading"
import { useUser } from "@/hooks/useAuth"

export function SplashScreen() {
    const { isLoading } = useUser()
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
                        <BabyBottleLoading className="w-24 h-24 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground/80 mt-2 font-geist-sans">
                            Baby App
                        </h1>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
