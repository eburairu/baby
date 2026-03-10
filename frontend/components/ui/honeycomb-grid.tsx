"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface HoneycombGridProps {
  children: React.ReactNode
  size: number        // 1つの六角形の基準サイズ (高さ = cellRadius * 2)
  gap?: number        // 六角形同士の隙間 (cellSpacing)
  className?: string
  rows?: ReadonlyArray<ReadonlyArray<number | null>>   // 各行のアイテム配置。null は空セル（スペーサー ）
  animate?: boolean    // 登場アニメーションを有効にするか
}

// アニメーションのバリアント定義
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
} as const

const itemVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 10
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
} as const

/**
 * ハニカム構造を自動配置するコンポーネント
 * 
 * 参考: https://bema.jp/articles/20250819/
 * 
 * 六角形グリッドの幾何学に基づき、隣接するセルの中 心を結ぶと
 * 正三角形を形成するよう配置する。
 * 
 * 幾何学計算（pointy-top正六角形）:
 *   cellRadius (r) = size / 2
 *   hexWidth  = r * √3 = size * √3/2
 *   hexHeight = r * 2  = size
 *   水平 center-to-center = hexWidth + gap
 *   垂直 center-to-center = r * 1.5 + gap * √3/2 = size*3/4 + gap*√3/2
 *   斜め center-to-center = hexWidth + gap（= 水平 と同じ → 正三角形）
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
  rows = [[0, 1, 2], [3, 4]] as ReadonlyArray<ReadonlyArray<number | null>>,
  animate = true
}: HoneycombGridProps) {
  const childrenArray = React.Children.toArray(children);

  // Pointy-topped 六角形の幾何学定数
  const hexWidth = (Math.sqrt(3) / 2) * size;
  const hexHeight = size;

  // 記事の幾何学に基づく垂直間隔
  // verticalSpacing = gap * √3/2（正三角形を形成す るための補正値）
  const verticalSpacing = gap * Math.sqrt(3) / 2;

  const Content = animate ? motion.div : "div";

  return (
    <Content 
      className={cn("relative flex flex-col items-center", className)}
      variants={animate ? containerVariants : undefined}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
    >
      {rows.map((rowItems, rowIndex) => {
        return (
          <div
            key={rowIndex}
            className="flex justify-center"
            style={{
              // 行間の垂直配置:
              // center-to-center = cellRadius * 1.5 + verticalSpacing
              //                  = hexHeight * 3/4 + gap * √3/2
              // marginTop = (hexHeight * 3/4 + verticalSpacing) - hexHeight
              //           = -hexHeight/4 + verticalSpacing
              marginTop: rowIndex === 0 ? 0 : -(hexHeight / 4) + verticalSpacing,
            }}
          >
            {rowItems.map((childIndex, itemIndex) => {
              // null は空セル（スペーサー）として幅を確保する
              if (childIndex === null) {
                return (
                  <div
                    key={`spacer-${rowIndex}-${itemIndex}`}
                    style={{
                      width: hexWidth,
                      height: hexHeight,
                      marginLeft: gap / 2,
                      marginRight: gap / 2,
                    }}
                  />
                );
              }

              const child = childrenArray[childIndex];
              if (!child) return null;

              const Item = animate ? motion.div : "div";

              return (
                <Item
                  key={childIndex}
                  className="relative flex items-center justify-center overflow-visible"
                  variants={animate ? itemVariants : undefined}
                  style={{
                    width: hexWidth,
                    height: hexHeight,
                    // 水平方向のみスペーシング（垂 直は行のmarginTopで制御）
                    marginLeft: gap / 2,
                    marginRight: gap / 2,
                  }}
                >
                  {child}
                </Item>
              );
            })}
          </div>
        );
      })}
    </Content>
  );
}
