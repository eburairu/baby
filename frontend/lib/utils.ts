import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDisplayName(user?: { username: string; display_name?: string | null } | null) {
  if (!user) return ""
  return user.display_name?.trim() || user.username
}
