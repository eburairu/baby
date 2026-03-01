'use client'

import { useMemo } from 'react'
import { INDICATOR_COLORS, getIndicatorColor } from '@/lib/indicatorUtils'
import { HEX_CONSTANTS } from './hexagon'

interface HexagonProgressArcProps {
  size: number
  progress: number
  isOverThreshold: boolean
  className?: string
}

export function HexagonProgressArc({
  size,
  progress,
  isOverThreshold,
  className,
}: HexagonProgressArcProps) {
  const { svgWidth, svgHeight, viewBox, pathD } = useMemo(() => {
    const cornerRadius = HEX_CONSTANTS.DEFAULT_CORNER_RADIUS
    const cx = size / 2
    const cy = size / 2
    // Hexagon.tsx の R = (size - borderWidth) / 2 - 2 に合わせる (borderWidth=0想定)
    const R = size / 2 - 2
    
    const maxRadius = (R * Math.sqrt(3)) / 2
    const r = Math.min(Math.max(0, cornerRadius), maxRadius)
    const offset = -Math.PI / 2 // pointy 固定

    const getPoint = (i: number) => {
      const angle = offset + (i % 6) * (Math.PI / 3)
      return { 
        x: cx + R * Math.cos(angle), 
        y: cy + R * Math.sin(angle) 
      }
    }

    let path = ""
    const d = r / Math.sqrt(3)
    const ratio = d / R

    for (let i = 0; i < 6; i++) {
      const vPrev = getPoint((i + 5) % 6)
      const v = getPoint(i)
      const vNext = getPoint((i + 1) % 6)

      if (r === 0) {
        path += i === 0 ? `M ${v.x},${v.y} ` : `L ${v.x},${v.y} `
      } else {
        const pIn = {
          x: v.x + (vPrev.x - v.x) * ratio,
          y: v.y + (vPrev.y - v.y) * ratio,
        }
        const pOut = {
          x: v.x + (vNext.x - v.x) * ratio,
          y: v.y + (vNext.y - v.y) * ratio,
        }

        path += i === 0 ? `M ${pIn.x},${pIn.y} ` : `L ${pIn.x},${pIn.y} `
        path += `A ${r},${r} 0 0,1 ${pOut.x},${pOut.y} `
      }
    }
    
    path += "Z"

    const w = size * HEX_CONSTANTS.POINTY_W_TO_H
    const h = size

    return {
      svgWidth: w,
      svgHeight: h,
      viewBox: `${(size - w) / 2} 0 ${w} ${h}`,
      pathD: path,
    }
  }, [size])

  const clampedProgress = Math.min(progress, 1)
  const color = INDICATOR_COLORS[getIndicatorColor(progress)]
  const pulseClass = isOverThreshold ? 'animate-pulse' : ''

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={viewBox}
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        pointerEvents: 'none',
        zIndex: 5
      }}
      className={`${className ?? ''}`.trim()}
    >
      {isOverThreshold && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={5}
          className="animate-ripple origin-center"
          style={{ transformBox: 'fill-box' }}
        />
      )}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={5}
        pathLength={1}
        strokeDasharray={`${clampedProgress} 1`}
        strokeDashoffset={0}
        strokeLinecap="round"
        className={pulseClass}
      />
    </svg>
  )
}
