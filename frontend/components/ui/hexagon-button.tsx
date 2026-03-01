"use client"

import * as React from "react"
import { Hexagon, HEX_CONSTANTS } from "./hexagon"
import { cn } from "@/lib/utils"
import { BabyBottleLoading } from "./baby-bottle-loading"
import { HEXAGON_BUTTON_THEMES } from "@/constants/ui-colors"
import { motion, HTMLMotionProps } from "framer-motion"

/**
 * Calculates the width and height of the hexagon container based on size and orientation.
 */
function getHexagonDimensions(size: number, pointy: boolean) {
  // Pointy-topped: width = size * 0.866
  const width = pointy ? size * HEX_CONSTANTS.POINTY_W_TO_H : size;
  const height = pointy ? size : size * HEX_CONSTANTS.FLAT_H_TO_W;
  return { width, height };
}

interface HexagonButtonProps extends HTMLMotionProps<"button"> {
  icon?: React.ReactNode
  label?: string
  loading?: boolean
  active?: boolean
  size?: number            // この size は正六角形の「高さ (直径)」に相当する
  pointy?: boolean
  variant?: keyof typeof HEXAGON_BUTTON_THEMES
  animationType?: "tilt" | "bounce" | "none"
}

export const HexagonButton = React.forwardRef<HTMLButtonElement, HexagonButtonProps>(({
  icon,
  label,
  loading = false,
  active = false,
  size = 64,
  pointy = true,
  variant = "primary",
  animationType = "tilt",
  className,
  children,
  ...props
}, ref) => {

  const theme = HEXAGON_BUTTON_THEMES[variant]
  const currentTheme = active ? theme.active : theme.inactive

  const { width, height } = getHexagonDimensions(size, pointy);

  // アイコンアニメーションの定義
  const iconVariants = {
    hover: animationType === "tilt" ? {
      rotate: [0, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 }
    } : animationType === "bounce" ? {
      y: [0, -4, 0],
      transition: { duration: 0.4 }
    } : {},
    tap: { scale: 0.9 }
  }

  return (
    <motion.button
      ref={ref}
      whileHover="hover"
      whileTap="tap"
      className={cn(
        "group relative flex flex-col items-center justify-center transition-transform disabled:opacity-50 disabled:pointer-events-none rounded-xl",
        "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-background",
        className
      )}
      disabled={loading}
      aria-busy={loading}
      aria-pressed={active}
      {...props}
      style={{ width, height, ...props.style } as React.CSSProperties}
    >
      <div className="relative w-full h-full">
        <Hexagon
          size={size}
          pointy={pointy}
          color="currentColor"
          className={cn(
            "transition-all duration-300 w-full h-full",
            currentTheme.bg,
            !active && "hover:opacity-90"
          )}
          borderColor={currentTheme.border}
          borderWidth={active ? 3 : 1}
        >
          <div className={cn(
            "flex items-center justify-center transition-colors duration-300 relative",
            currentTheme.icon
          )}>
            <motion.div 
              variants={iconVariants}
              className={cn("flex items-center justify-center transition-opacity duration-200", loading ? "opacity-0" : "opacity-100")}
            >
              {icon || children}
            </motion.div>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <BabyBottleLoading className="h-6 w-6" />
              </div>
            )}
          </div>
        </Hexagon>
        
        {active && (
          <div className={cn("absolute inset-0 blur-xl -z-10 animate-pulse", theme.active.glow)} />
        )}
      </div>
      
      {label && (
        <span className="absolute -bottom-5 text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-tighter whitespace-nowrap">
          {label}
        </span>
      )}
    </motion.button>
  )
})
HexagonButton.displayName = "HexagonButton"
