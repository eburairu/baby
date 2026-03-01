"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { HexagonButton } from "@/components/ui/hexagon-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <HexagonButton
          variant="zinc"
          size={40}
          className="dark:bg-zinc-900 dark:border-zinc-800 cursor-pointer"
          icon={
            <>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">テーマを切り替える</span>
            </>
          }
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-zinc-900 dark:border-zinc-800">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 dark:focus:bg-zinc-800">
          <Sun className="h-4 w-4" />
          <span>ライトモード</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 dark:focus:bg-zinc-800">
          <Moon className="h-4 w-4" />
          <span>ダークモード</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 dark:focus:bg-zinc-800">
          <Monitor className="h-4 w-4" />
          <span>システム設定</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
