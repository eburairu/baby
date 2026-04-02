"use client";

import Link from "next/link";
import { ChevronLeft, LucideIcon } from "lucide-react";

interface SettingsHeaderProps {
    title: string;
    icon?: LucideIcon;
    children?: React.ReactNode;
    showBackButton?: boolean;
}

export function SettingsHeader({
    title,
    icon: Icon,
    children,
    showBackButton = true,
}: SettingsHeaderProps) {
    return (
        <header className={`sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-zinc-800 h-14 flex items-center px-4 ${showBackButton ? "gap-3" : "justify-center"}`}>
            {showBackButton && (
                <Link
                    href="/settings"
                    aria-label="設定メニューに戻る"
                    className="p-1 -ml-1 text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-100 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
            )}
            <div className={`flex items-center gap-2 ${showBackButton ? "flex-1" : ""}`}>
                {Icon && <Icon className="h-4 w-4 text-violet-600" />}
                <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100" data-sentry-unmask>
                    {title}
                </h1>
            </div>
            {children && <div>{children}</div>}
        </header>
    );
}
