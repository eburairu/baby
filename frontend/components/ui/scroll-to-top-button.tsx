'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={cn(
            "fixed right-6 z-40 rounded-full p-3 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            hasBottomBar ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-6" : "bottom-6"
          )}
          aria-label="ページトップへ戻る"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
