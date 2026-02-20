"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useId } from "react"

interface BabyBottleLoadingProps {
    className?: string
    color?: string
}

export function BabyBottleLoading({ className, color = "currentColor" }: BabyBottleLoadingProps) {
    const id = useId()
    const clipId = `bottle-liquid-clip-${id.replace(/:/g, "")}`

    // 外部から色指定（text-xxx）がない場合、ライトモードで黒、ダークモードで白にする
    const defaultColorClass = !className?.includes("text-") ? "text-black dark:text-white" : ""

    return (
        <div className={cn("relative flex items-center justify-center", defaultColorClass, className)}>
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full transition-colors duration-200"
                initial={{ rotate: -10 }}
                animate={{
                    rotate: [10, -10, 10],
                    y: [0, -2, 0]
                }}
                transition={{
                    rotate: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "reverse"
                    },
                    y: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "reverse"
                    }
                }}
            >
                <defs>
                    <clipPath id={clipId}>
                        <path d="M7 8v10a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8H7z" />
                    </clipPath>
                </defs>

                {/* Bottle Interior Background - Rendered before liquid so white liquid is visible against it */}
                <path
                    d="M7 8v10a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8H7z"
                    stroke="none"
                    fill="currentColor"
                    fillOpacity={0.2}
                />

                {/* Liquid Group - Rendered First (Behind) */}
                <g clipPath={`url(#${clipId})`}>
                    {/* Liquid Body (Synced with surface) */}
                    <motion.path
                        d="M5 15 q 7 2 14 0 V 24 H 5 Z"
                        fill="white"
                        className="stroke-none"
                        animate={{
                            d: [
                                "M5 15 q 7 2 14 0 V 24 H 5 Z",
                                "M5 14 q 7 -2 14 0 V 24 H 5 Z",
                                "M5 15 q 7 2 14 0 V 24 H 5 Z"
                            ]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    
                    {/* Liquid Surface */}
                    <motion.path
                        d="M5 15 q 7 2 14 0"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        animate={{
                            d: [
                                "M5 15 q 7 2 14 0",
                                "M5 14 q 7 -2 14 0",
                                "M5 15 q 7 2 14 0"
                            ]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </g>

                {/* Nipple - 塗りつぶしあり */}
                <path d="M10 5V4a2 2 0 0 1 4 0v1" stroke="currentColor" fill="currentColor" />

                {/* Collar - 塗りつぶしあり */}
                <rect x="7" y="5" width="10" height="2" rx="1" stroke="currentColor" fill="currentColor" />

                {/* Bottle Body - Semi-transparent container */}
                <path
                    d="M7 8v10a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8H7z"
                    stroke="currentColor"
                    className="fill-current/5 dark:fill-current/10"
                />

                {/* Measurement Lines */}
                <path d="M14 11h-2" stroke="currentColor" className="opacity-40" strokeWidth="1.5" />
                <path d="M14 14h-2" stroke="currentColor" className="opacity-40" strokeWidth="1.5" />
                <path d="M14 17h-2" stroke="currentColor" className="opacity-40" strokeWidth="1.5" />
            </motion.svg>
        </div>
    )
}
