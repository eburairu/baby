"use client"
import { createContext, useContext, useEffect, useState } from "react"

type UIVersion = "v1" | "v2"
const STORAGE_KEY = "botoro-ui-version"

interface UIVersionContextValue {
  version: UIVersion
  isV2: boolean
  toggle: () => void
  setVersion: (v: UIVersion) => void
}

const UIVersionContext = createContext<UIVersionContextValue>({
  version: "v1",
  isV2: false,
  toggle: () => {},
  setVersion: () => {},
})

export function UIVersionProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersionState] = useState<UIVersion>(() => {
    if (typeof window === "undefined") return "v1"
    const stored = localStorage.getItem(STORAGE_KEY) as UIVersion | null
    return stored === "v2" ? "v2" : "v1"
  })

  useEffect(() => {
    if (version === "v2") {
      document.documentElement.setAttribute("data-ui-v2", "")
    } else {
      document.documentElement.removeAttribute("data-ui-v2")
    }
  }, [version])

  const setVersion = (v: UIVersion) => {
    setVersionState(v)
    localStorage.setItem(STORAGE_KEY, v)
    if (v === "v2") {
      document.documentElement.setAttribute("data-ui-v2", "")
    } else {
      document.documentElement.removeAttribute("data-ui-v2")
    }
  }

  return (
    <UIVersionContext.Provider value={{
      version,
      isV2: version === "v2",
      toggle: () => setVersion(version === "v1" ? "v2" : "v1"),
      setVersion,
    }}>
      {children}
    </UIVersionContext.Provider>
  )
}

export const useUIVersion = () => useContext(UIVersionContext)
