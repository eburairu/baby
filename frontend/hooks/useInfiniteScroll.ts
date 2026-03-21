import { useEffect, useRef, useState } from "react"

interface UseInfiniteScrollOptions {
    /** IntersectionObserver threshold (0.0 - 1.0) */
    threshold?: number
    /** Initial number of items to show */
    initialCount?: number
    /** Number of items to add on each load */
    step?: number
}

export function useInfiniteScroll<T>(
    items: T[],
    { threshold = 0.1, initialCount = 10, step = 10 }: UseInfiniteScrollOptions = {}
) {
    const [visibleCount, setVisibleCount] = useState(initialCount)
    const sentinelRef = useRef<HTMLDivElement>(null)

    const visibleItems = items.slice(0, visibleCount)
    const hasMore = visibleCount < items.length

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => prev + step)
                }
            },
            { threshold }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasMore, step, threshold])

    return {
        visibleItems,
        hasMore,
        sentinelRef,
        visibleCount,
    }
}
