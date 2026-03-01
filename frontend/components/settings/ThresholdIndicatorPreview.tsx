interface Props {
  thresholdMinutes: number
}

export function ThresholdIndicatorPreview({ thresholdMinutes }: Props) {
  const yellowThreshold = Math.floor(thresholdMinutes * 0.6)
  const redThreshold = Math.floor(thresholdMinutes * 0.8)

  return (
    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
      <div className="flex justify-between px-1 mb-1">
        <span>ステータスバーの色の目安:</span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="bg-green-500 transition-all" style={{ width: "60%" }} />
        <div className="bg-yellow-500 transition-all" style={{ width: "20%" }} />
        <div className="bg-red-500 transition-all" style={{ width: "20%" }} />
      </div>
      <div className="flex justify-between px-1 pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>~{Math.max(0, yellowThreshold - 1)}分</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span>{yellowThreshold}分~</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span>{redThreshold}分~</span>
        </div>
      </div>
    </div>
  )
}
