"use client"

import * as React from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { BabyBottleLoading } from "./baby-bottle-loading"
import { Hexagon } from "./hexagon"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
    onRefresh: () => Promise<unknown>
    children: React.ReactNode
    className?: string
    pullThreshold?: number
}

export function PullToRefresh({
    onRefresh,
    children,
    className,
    pullThreshold = 80
}: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = React.useState(false)
    const y = useMotionValue(0)
    
    // Calculate rotation and opacity based on pull distance
    const rotate = useTransform(y, [0, pullThreshold], [0, 360])
    const opacity = useTransform(y, [0, pullThreshold / 2, pullThreshold], [0, 0.5, 1])
    const scale = useTransform(y, [0, pullThreshold], [0.5, 1])

    const containerRef = React.useRef<HTMLDivElement>(null)

    const [startY, setStartY] = React.useState<number | null>(null)

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isRefreshing) return
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        if (scrollTop <= 0) {
            setStartY(e.touches[0].clientY)
        } else {
            setStartY(null)
        }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === null || isRefreshing) return
        
        const currentY = e.touches[0].clientY
        const diff = currentY - startY
        
        if (diff > 0) {
            // Pull down at the top
            const newY = Math.min(diff * 0.4, pullThreshold + 20)
            y.set(newY)
            
            // Prevent browser's native pull-to-refresh if possible when we handle it
            if (diff > 10 && e.cancelable) {
                e.preventDefault()
            }
        } else if (diff < 0) {
            // User is scrolling up (normal scroll down behavior)
            y.set(0)
            setStartY(null)
        }
    }

    const handleTouchEnd = () => {
        if (startY === null || isRefreshing) return
        
        if (y.get() >= pullThreshold) {
            setIsRefreshing(true)
            animate(y, pullThreshold, { type: "spring", stiffness: 300, damping: 30 })
            
            onRefresh().finally(() => {
                setIsRefreshing(false)
                animate(y, 0, { type: "spring", stiffness: 300, damping: 30 })
            })
        } else {
            animate(y, 0, { type: "spring", stiffness: 300, damping: 30 })
        }
        setStartY(null)
    }

    return (
        <div 
            ref={containerRef} 
            className={cn("relative w-full", className)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            {/* Loading Indicator Area */}
            <motion.div
                style={{ opacity, scale, height: pullThreshold }}
                className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-0"
            >
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-0.5 shadow-lg border border-slate-200 dark:border-zinc-700 overflow-hidden">
                    <motion.div style={{ rotate: isRefreshing ? undefined : rotate }}>
                        <Hexagon size={48} color="transparent" className="flex items-center justify-center relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <BabyBottleLoading className="w-6 h-6 text-primary" />
                            </div>
                        </Hexagon>
                    </motion.div>
                </div>
            </motion.div>

            {/* Content Area */}
            <motion.div
                style={{ y }}
                className="relative z-10 will-change-transform"
            >
                {children}
            </motion.div>
        </div>
    )
}
