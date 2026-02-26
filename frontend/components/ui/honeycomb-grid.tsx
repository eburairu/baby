"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface HoneycombGridProps {
  children: React.ReactNode
  size: number        // 1つの六角形の基準サイズ (高さ)
  gap?: number        // 六角形同士の隙間
  className?: string
  rows?: number[][]   // 各行に何個のアイテムを配置するか [[0,1,2], [3,4]] のようにインデックスで指定
}

/**
 * ハニカム構造を自動配置するコンポーネント
 * flex justify-center により、奇数個/偶数個の行が自然に互い違い（スタッガード）に配置されます。
 */
export function HoneycombGrid({
  children,
  size,
  gap = 4,
  className,
  rows = [[0, 1, 2], [3, 4]]
}: HoneycombGridProps) {
  const childrenArray = React.Children.toArray(children);
  
  // Pointy-topped 六角形の幾何学定数
  // 幅 = sqrt(3)/2 * 高さ
  const width = (Math.sqrt(3) / 2) * size;
  const height = size;
  
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {rows.map((rowItems, rowIndex) => {
        return (
          <div 
            key={rowIndex}
            className="flex justify-center"
            style={{
              // 行間の垂直方向の重なりを調整 (高さの1/4が標準的なハニカムの重なり)
              marginTop: rowIndex === 0 ? 0 : -(height / 4) + gap,
            }}
          >
            {rowItems.map((childIndex) => {
              const child = childrenArray[childIndex];
              if (!child) return null;
              
              return (
                <div 
                  key={childIndex}
                  className="relative flex items-center justify-center overflow-visible"
                  style={{
                    width: width,
                    height: height,
                    margin: gap / 2,
                  }}
                >
                  {child}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
