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
 * 3-2-3 などのハニカム構造を自動配置するコンポーネント
 */
export function HoneycombGrid({
  children,
  size,
  gap = 4,
  className,
  rows = [[0, 1, 2], [3, 4]] // デフォルトは上段3個、下段2個
}: HoneycombGridProps) {
  const childrenArray = React.Children.toArray(children);
  
  // Pointy-topped 六角形の幾何学定数
  const width = (Math.sqrt(3) / 2) * size;
  const height = size;
  
  // 水平方向の距離（中心から中心まで）
  const horizontalSpacing = width + gap;

  return (
    <div 
      className={cn("relative flex flex-col items-center", className)}
      style={{
        // 全体の高さ調整などが必要な場合はここで
      }}
    >
      {rows.map((rowItems, rowIndex) => {
        // 行ごとのオフセット（偶数行か奇数行かで横にずらす）
        // 1行目が3個、2行目が2個の場合、2行目は半分ずらす
        const isStaggered = rowItems.length < Math.max(...rows.map(r => r.length));
        const rowOffsetX = isStaggered ? horizontalSpacing / 2 : 0;
        
        return (
          <div 
            key={rowIndex}
            className="flex justify-center"
            style={{
              marginTop: rowIndex === 0 ? 0 : -(height / 4) + gap, // 行間の重なりを調整
              marginLeft: rowOffsetX,
              marginRight: -rowOffsetX, // センタリングを維持するための負のマージン
            }}
          >
            {rowItems.map((childIndex) => {
              const child = childrenArray[childIndex];
              if (!child) return null;
              
              return (
                <div 
                  key={childIndex}
                  className="relative"
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
