"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface HoneycombGridProps {
  children: React.ReactNode
  size: number        // 1つの六角形の基準サイズ (高さ)
  gap?: number        // 六角形同士の隙間
  className?: string
  rows?: number[][]   // 各行に何個のアイテムを配置するか [[0,1,2], [3,4], [5,6,7]] のようにインデックスで指定
}

/**
 * ハニカム構造を自動配置するコンポーネント
 * 
 * 参考: https://bema.jp/articles/20250819/
 * 
 * 六角形グリッドの幾何学に基づき、各行のアイテム数差分から
 * 自動的にスタッガードオフセットを計算してダイヤモンド型のハニカムを形成する。
 * 
 * 対応パターン例:
 *   3-2-3: [[0,1,2], [3,4], [5,6,7]]
 *   4-3-4: [[0,1,2,3], [4,5,6], [7,8,9,10]]
 *   3-3:   [[0,1,2], [3,4,5]]
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
  const hexWidth = (Math.sqrt(3) / 2) * size;
  const hexHeight = size;

  // 各行の最大アイテム数を取得
  const maxItemsInRow = Math.max(...rows.map(r => r.length));

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {rows.map((rowItems, rowIndex) => {
        // この行が最大行よりも少ない場合、半幅オフセットを適用（スタッガード）
        const isStaggered = rowItems.length < maxItemsInRow;

        return (
          <div
            key={rowIndex}
            className="flex justify-center"
            style={{
              // 行間の垂直方向の重なり: height * 3/4 の位置に次行を配置
              // = -(height - height*3/4) + gap = -(height/4) + gap
              marginTop: rowIndex === 0 ? 0 : -(hexHeight / 4) + gap,
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
                    width: hexWidth,
                    height: hexHeight,
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
