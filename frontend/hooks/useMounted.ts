import { useState, useEffect } from "react"

export function useMounted(delay: number = 0, isAsync: boolean = true) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (isAsync || delay > 0) {
            // setTimeout を使って非同期にマウント状態を更新することで、
            // React Compilerの「同期的なsetStateによるカスケーディングレンダー」の警告を回避します。
            const timer = setTimeout(() => {
                setMounted(true)
            }, delay)
            return () => clearTimeout(timer)
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMounted(true)
        }
    }, [delay, isAsync])

    return mounted
}
