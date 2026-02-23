"use client"

import * as React from "react"
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion"
import { BabyBottleLoading } from "./baby-bottle-loading"
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

    const handlePan = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (isRefreshing) return

        // Only allow pulling down if at the top of the container
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        if (scrollTop > 0) return

        if (info.offset.y > 0) {
            // Resistance: pull harder as it goes deeper
            const newY = Math.min(info.offset.y * 0.4, pullThreshold + 20)
            y.set(newY)
        }
    }

    const handlePanEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (isRefreshing) return

        if (y.get() >= pullThreshold || info.offset.y > pullThreshold) {
            setIsRefreshing(true)
            // Animate to holding position
            animate(y, pullThreshold, { type: "spring", stiffness: 300, damping: 30 })
            
            try {
                await onRefresh()
            } finally {
                setIsRefreshing(false)
                animate(y, 0, { type: "spring", stiffness: 300, damping: 30 })
            }
        } else {
            animate(y, 0, { type: "spring", stiffness: 300, damping: 30 })
        }
    }

    return (
        <div 
            ref={containerRef} 
            className={cn("relative w-full overflow-hidden", className)}
            style={{ overscrollBehaviorY: "contain" }}
        >
            {/* Loading Indicator Area */}
            <motion.div
                style={{ y, opacity, scale, height: pullThreshold }}
                className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden"
            >
                <div className="bg-white dark:bg-zinc-800 rounded-full p-2 shadow-lg border border-slate-200 dark:border-zinc-700 mt-2">
                    <motion.div style={{ rotate: isRefreshing ? undefined : rotate }}>
                        <BabyBottleLoading className="w-8 h-8 text-primary" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Content Area */}
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.6}
                onPan={handlePan}
                onPanEnd={handlePanEnd}
                style={{ y }}
                className="relative z-10 will-change-transform"
            >
                {children}
            </motion.div>
        </div>
    )
}
