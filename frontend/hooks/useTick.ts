import { useState } from "react"
import { useInterval } from "./useInterval"

/**
 * 指定した間隔（ミリ秒）ごとに再レンダリングをトリガーするためのフック。
 * `delay` を指定しない場合は、デフォルトで1分（60000ms）ごとに再レンダリングされます。
 *
 * @param delay 更新間隔（ミリ秒）。null の場合はタイマーを停止。
 * @returns 増加し続ける数値（tick）
 */
export function useTick(delay: number | null = 60000): number {
    const [tick, setTick] = useState(0)

    useInterval(() => {
        setTick((t) => t + 1)
    }, delay)

    return tick
}
