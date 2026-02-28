import { ChevronRight, LucideIcon } from "lucide-react"
import Link from "next/link"
import React from "react"

interface SettingItemProps {
    href?: string
    onClick?: () => void
    icon: LucideIcon
    label: string
    description: React.ReactNode
    colorClass?: string
    bgClass?: string
    isDestructive?: boolean
    rightElement?: React.ReactNode
}

export function SettingItem({
    href,
    onClick,
    icon: Icon,
    label,
    description,
    colorClass = "text-gray-600 dark:text-zinc-400",
    bgClass = "bg-gray-100 dark:bg-zinc-800",
    isDestructive = false,
    rightElement,
}: SettingItemProps) {
    const content = (
        <div className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-sm p-4 flex items-center gap-4 transition-colors ${
            onClick || href ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800" : ""
        } ${
            isDestructive ? "hover:bg-red-50 dark:hover:bg-red-950/20 group" : ""
        }`}>
            <div className={`p-2 rounded-xl ${bgClass} ${
                isDestructive ? "group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors" : ""
            }`}>
                <Icon className={`h-5 w-5 ${colorClass} ${
                    isDestructive ? "group-hover:text-red-600 dark:group-hover:text-red-400" : ""
                }`} />
            </div>
            <div className="flex-1">
                <p className={`font-semibold text-gray-900 dark:text-zinc-100 text-sm ${
                    isDestructive ? "group-hover:text-red-600 dark:group-hover:text-red-400" : ""
                }`}>
                    {label}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                    {description}
                </p>
            </div>
            {rightElement ? (
                rightElement
            ) : (href || onClick) ? (
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-zinc-600" />
            ) : null}
        </div>
    )

    if (href) {
        return <Link href={href}>{content}</Link>
    }

    if (onClick) {
        return <div onClick={onClick}>{content}</div>
    }

    return content
}
