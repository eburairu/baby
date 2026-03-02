import { useState, useCallback, useRef, useEffect } from "react"

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)

        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
          setCopied(false)
          timerRef.current = null
        }, timeout)

        return true
      } catch (error) {
        console.error("Failed to copy to clipboard", error)
        return false
      }
    },
    [timeout]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return { copied, copyToClipboard }
}
