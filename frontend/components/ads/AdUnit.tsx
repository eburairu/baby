'use client'

import { useEffect } from 'react'

interface AdUnitProps {
  slot: string
  format?: string
  layout?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdUnit({
  slot,
  format = 'fluid',
  layout = 'in-article'
}: AdUnitProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && slot) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [slot])

  if (!slot) return null

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl py-2 px-3 min-h-[100px] border-t border-gray-100 dark:border-gray-700">
      <span className="text-xs text-gray-400">広告</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
      />
    </div>
  )
}
