"use client"

import React, { useMemo } from 'react';
import { cn } from "@/lib/utils"

interface HexagonProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  size?: number            // 全体のサイズ
  cornerRadius?: number    // 角の丸み（0でシャープになります）
  pointy?: boolean         // true: 頂点が上 / false: 平らな面が上
  color?: string           // 塗りつぶしの色
  borderColor?: string     // 線の色
  borderWidth?: number     // 線の太さ
}

export const Hexagon = ({
  children,
  size = 100,
  cornerRadius = 8,
  pointy = false,
  color = "currentColor",
  borderColor = "transparent",
  borderWidth = 0,
  className = "",
  ...props
}: HexagonProps) => {
  const pathData = useMemo(() => {
    // 1. 中心座標とマージンを考慮した半径の計算
    const cx = size / 2;
    const cy = size / 2;
    // 線の太さがキャンバス外にはみ出さないよう、半径から引いてマージンを確保
    const R = (size - borderWidth) / 2 - 2; 

    // 2. 丸みの最大値を制限（大きすぎると図形が破綻するため）
    const maxRadius = (R * Math.sqrt(3)) / 2;
    const r = Math.min(Math.max(0, cornerRadius), maxRadius);

    // 3. 向きによる角度のオフセット
    // pointy=true (頂点が上): -30度 (-PI/6)
    // pointy=false (平らな面が上): 0度
    const offset = pointy ? -Math.PI / 6 : 0;

    // 頂点の座標を計算するヘルパー関数
    const getPoint = (i: number) => {
      const angle = offset + (i % 6) * (Math.PI / 3);
      return { 
        x: cx + R * Math.cos(angle), 
        y: cy + R * Math.sin(angle) 
      };
    };

    let path = "";
    
    // 4. 角を丸めるための直線の短縮率を計算
    const d = r / Math.sqrt(3);
    const ratio = d / R;

    for (let i = 0; i < 6; i++) {
      const vPrev = getPoint((i + 5) % 6); // 1つ前の頂点
      const v = getPoint(i);               // 現在の頂点
      const vNext = getPoint((i + 1) % 6); // 1つ次の頂点

      if (r === 0) {
        // 丸みゼロの場合は単純な直線
        path += i === 0 ? `M ${v.x},${v.y} ` : `L ${v.x},${v.y} `;
      } else {
        // カーブの開始点
        const pIn = {
          x: v.x + (vPrev.x - v.x) * ratio,
          y: v.y + (vPrev.y - v.y) * ratio,
        };
        // カーブの終了点
        const pOut = {
          x: v.x + (vNext.x - v.x) * ratio,
          y: v.y + (vNext.y - v.y) * ratio,
        };

        path += i === 0 ? `M ${pIn.x},${pIn.y} ` : `L ${pIn.x},${pIn.y} `;
        path += `A ${r},${r} 0 0,1 ${pOut.x},${pOut.y} `;
      }
    }
    
    path += "Z";
    return path;
  }, [size, cornerRadius, pointy, borderWidth]);

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        className="absolute inset-0 w-full h-full drop-shadow-sm transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d={pathData} 
          fill={color} 
          stroke={borderColor} 
          strokeWidth={borderWidth} 
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />
      </svg>
      {children && (
        <div className="relative z-10 flex items-center justify-center w-full h-full p-[15%]">
          {children}
        </div>
      )}
    </div>
  );
};
