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
  // 正六角形の正確な比率は 1 : 1.1547 (2/sqrt(3))
  // viewBox="0 0 100 115.47"
  
  // 角を丸めるためのパス（ベジェ曲線を使用）
  const path = rounded
    ? "M50 2 C53.5 2 56.5 3.5 58.5 5 L91.5 24 C94.5 26 96.5 29.5 96.5 33 L96.5 82.5 C96.5 86 94.5 89.5 91.5 91.5 L58.5 110.5 C56.5 112 53.5 113.5 50 113.5 C46.5 113.5 43.5 112 41.5 110.5 L8.5 91.5 C5.5 89.5 3.5 86 3.5 82.5 L3.5 33 C3.5 29.5 5.5 26 8.5 24 L41.5 5 C43.5 3.5 46.5 2 50 2 Z"
    : "M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z"

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: "auto", aspectRatio: "100/115.47" }}
      {...props}
    >
      <svg
        viewBox="0 0 100 115.47"
        className="absolute inset-0 w-full h-full drop-shadow-sm transition-all duration-300"
      >
        <path
          d={path}
          fill={color}
          stroke={borderColor}
          strokeWidth={borderWidth}
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center w-full h-full p-[15%]">
        {children}
      </div>
    </div>
  )
}
