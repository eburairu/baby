"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"

interface AnimatedNumberProps {
    value: number
    className?: string
}

/**
 * 数値が変化したとき、前の値から新しい値へカウントアップ/ダウンするアニメーションコンポーネント
 */
export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
    const count = useMotionValue(value)
    const rounded = useTransform(count, Math.round)

    useEffect(() => {
        const animation = animate(count, value, {
            duration: 0.6,
            ease: "easeOut",
        })
        return animation.stop
    }, [value, count])

    return <motion.span className={className}>{rounded}</motion.span>
}
