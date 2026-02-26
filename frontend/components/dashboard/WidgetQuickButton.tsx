"use client"
import { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { HexagonButton } from "@/components/ui/hexagon-button"

interface WidgetQuickButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    color: "rose" | "amber" | "indigo"
    isActive?: boolean
    loading?: boolean
    size?: number
    pointy?: boolean
}

export function WidgetQuickButton({
    color,
    isActive = false,
    loading = false,
    className,
    children,
    size = 48,
    pointy = true,
    ...props
}: WidgetQuickButtonProps) {
    return (
        <HexagonButton
            variant={color}
            active={isActive}
            loading={loading}
            size={size}
            pointy={pointy}
            className={cn("flex-shrink-0", className)}
            {...props}
        >
            {children}
        </HexagonButton>
    )
}
