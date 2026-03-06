export const getChartTooltipStyle = (isDark: boolean) => ({
    backgroundColor: isDark ? "#18181b" : "#ffffff",
    border: `1px solid ${isDark ? "#3f3f46" : "#e5e7eb"}`,
    borderRadius: "8px",
    fontSize: "12px",
    color: isDark ? "#f4f4f5" : "#1f2937",
});

export const getChartGridColor = (isDark: boolean) => isDark ? "#3f3f46" : "#e5e7eb";
export const getChartTextColor = (isDark: boolean) => isDark ? "#a1a1aa" : "#6b7280";
