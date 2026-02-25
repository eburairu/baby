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
  // SSR/hydration安全のため常に"v1"で初期化する。
  // Lazy InitializerでlocalStorageを読むとビルド時(v1)とクライアント初回レンダリング(v2)が
  // 不一致になりhydrationエラーが発生するため、useEffect内で読み込む。
  const [version, setVersionState] = useState<UIVersion>("v1")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as UIVersion | null
    const v: UIVersion = stored === "v2" ? "v2" : "v1"
    // DOMへの反映は同期的に行い、UIのちらつきを最小化する
    if (v === "v2") {
      document.documentElement.setAttribute("data-ui-v2", "")
    }
    if (v !== "v1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVersionState(v)
    }
  }, [])

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
