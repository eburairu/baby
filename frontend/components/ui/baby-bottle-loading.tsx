"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BabyBottleLoadingProps {
    className?: string
    color?: string
}

export function BabyBottleLoading({ className, color = "currentColor" }: BabyBottleLoadingProps) {
    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full"
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
                    <clipPath id="bottle-liquid-clip">
                        <path d="M7 8v10a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8H7z" />
                    </clipPath>
                </defs>

                {/* Nipple */}
                <path d="M10 5V4a2 2 0 0 1 4 0v1" strokeWidth="2" />

                {/* Collar */}
                <rect x="7" y="5" width="10" height="3" rx="1" strokeWidth="2" />

                {/* Bottle Body */}
                <path d="M7 8v10a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8H7z" strokeWidth="2" />

                {/* Measurement Lines */}
                <path d="M14 11h-2" className="opacity-40" strokeWidth="1.5" />
                <path d="M14 14h-2" className="opacity-40" strokeWidth="1.5" />
                <path d="M14 17h-2" className="opacity-40" strokeWidth="1.5" />

                {/* Liquid Group */}
                <g clipPath="url(#bottle-liquid-clip)">
                    {/* Liquid Fill */}
                    <motion.rect
                        x="0"
                        y="12"
                        width="24"
                        height="12"
                        className="fill-indigo-200 dark:fill-indigo-900/50 stroke-none"
                        animate={{
                            y: [12, 10, 12],
                            rotate: [5, -5, 5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatType: "reverse"
                        }}
                        style={{ originX: 0.5, originY: 0.5 }}
                    />
                    {/* Liquid Surface */}
                    <motion.path
                        d="M5 12 q 7 2 14 0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-indigo-400 dark:text-indigo-300"
                        animate={{
                            d: [
                                "M5 12 q 7 2 14 0",
                                "M5 12 q 7 -2 14 0"
                            ]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatType: "reverse"
                        }}
                    />
                </g>
            </motion.svg>
        </div>
    )
}
