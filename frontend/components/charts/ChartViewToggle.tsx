"use client"

export type ChartView = "trend" | "rhythm" | "compare"

export function getChartViewTitle(view: ChartView): string {
    switch (view) {
        case "trend":
            return "7日間の推移"
        case "rhythm":
            return "生活リズム（過去7日）"
        case "compare":
            return "今日 vs 7日平均"
        default:
            return ""
    }
}

const VIEWS: { key: ChartView; label: string }[] = [
    { key: "trend", label: "推移" },
    { key: "rhythm", label: "リズム" },
    { key: "compare", label: "比較" },
]

interface ChartViewToggleProps {
    view: ChartView
    onChange: (v: ChartView) => void
}

export function ChartViewToggle({ view, onChange }: ChartViewToggleProps) {
    return (
        <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-zinc-800" role="tablist" aria-label="チャートビューの切り替え">
            {VIEWS.map(({ key: v, label }) => {
                const active = view === v
                return (
                    <button
                        key={v}
                        role="tab"
                        aria-selected={active}
                        aria-controls={`chart-panel-${v}`}
                        id={`chart-tab-${v}`}
                        onClick={() => onChange(v)}
                        className={[
                            "rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-zinc-800",
                            active
                                ? "bg-white text-gray-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                                : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200",
                        ].join(" ")}
                    >
                        {label}
                    </button>

                )
            })}
        </div>
    )
}
