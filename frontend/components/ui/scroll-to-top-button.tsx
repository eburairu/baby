'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HexagonButton } from './hexagon-button'

export function ScrollToTopButton({ hasBottomBar = false }: { hasBottomBar?: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <div className={cn(
            "fixed right-6 z-40 transition-all",
            hasBottomBar ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-6" : "bottom-6"
        )}>
          <HexagonButton
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            variant="primary"
            size={56}
            className="shadow-lg"
            aria-label="ページトップへ戻る"
            icon={<ArrowUp className="h-5 w-5" />}
          />
        </div>
      )}
    </AnimatePresence>
  )
}
