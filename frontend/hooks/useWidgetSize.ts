"use client"
import { useWindowSize } from "@/hooks/useWindowSize"
import { DASHBOARD_UI } from "@/constants/dashboard"

export function useWidgetSize() {
    const { width } = useWindowSize()
    return (width && width < 640)
        ? DASHBOARD_UI.WIDGET_SIZE.MOBILE
        : DASHBOARD_UI.WIDGET_SIZE.DESKTOP
}
