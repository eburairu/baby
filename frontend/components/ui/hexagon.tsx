import * as React from "react"
import { cn } from "@/lib/utils"

interface HexagonProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  size?: number | string
  color?: string
  borderColor?: string
  borderWidth?: number
  rounded?: boolean
}

export function Hexagon({
  children,
  className,
  size = "100%",
  color = "currentColor",
  borderColor,
  borderWidth = 0,
  rounded = true,
  ...props
}: HexagonProps) {
  // 正六角形のパス（角を丸めるための調整を含む）
  // 頂点が上下にくるタイプ (Pointy-topped)
  // viewBox="0 0 100 116" (100 * sqrt(3)/2 = 86.6 -> 100:116)
  
  const path = rounded
    ? "M50 3.5 L91.3 27.5 C94.5 29.3 96.5 32.8 96.5 36.5 L96.5 79.5 C96.5 83.2 94.5 86.7 91.3 88.5 L50 112.5 C46.8 114.3 43.2 114.3 40 112.5 L8.7 88.5 C5.5 86.7 3.5 83.2 3.5 79.5 L3.5 36.5 C3.5 32.8 5.5 29.3 8.7 27.5 L40 3.5 C43.2 1.7 46.8 1.7 50 3.5 Z"
    : "M50 0 L100 28.8 L100 87.2 L50 116 L0 87.2 L0 28.8 Z"

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: "auto", aspectRatio: "100/116" }}
      {...props}
    >
      <svg
        viewBox="0 0 100 116"
        className="absolute inset-0 w-full h-full drop-shadow-sm transition-all duration-300"
        style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))" }}
      >
        <path
          d={path}
          fill={color}
          stroke={borderColor}
          strokeWidth={borderWidth}
          className="transition-colors duration-300"
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center w-full h-full p-[15%]">
        {children}
      </div>
    </div>
  )
}
