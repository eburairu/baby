"use client"

interface ChartViewToggleProps {
    view: "trend" | "rhythm"
    onChange: (v: "trend" | "rhythm") => void
}

export function ChartViewToggle({ view, onChange }: ChartViewToggleProps) {
    return (
        <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-zinc-800">
            {(["trend", "rhythm"] as const).map((v) => {
                const label = v === "trend" ? "推移" : "リズム"
                const active = view === v
                return (
                    <button
                        key={v}
                        onClick={() => onChange(v)}
                        className={[
                            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
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
