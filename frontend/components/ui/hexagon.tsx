"use client"

import React, { useMemo } from 'react';
import { cn } from "@/lib/utils"

interface HexagonProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  size?: number            // 全体のサイズ（正方形の1辺の長さとして扱う）
  cornerRadius?: number    // 角の丸み
  pointy?: boolean         // true: 頂点が上 / false: 平らな面が上
  color?: string           // 塗りつぶしの色
  borderColor?: string     // 線の色
  borderWidth?: number     // 線の太さ
}

/**
 * 六角形の幾何学定数
 */
export const HEX_CONSTANTS = {
  SQRT_3: Math.sqrt(3),
  // Pointy-topped の場合の幅と高さの比率 (width/height)
  POINTY_W_TO_H: Math.sqrt(3) / 2, // 0.866
  // Flat-topped の場合の幅と高さの比率 (height/width)
  FLAT_H_TO_W: Math.sqrt(3) / 2,
};

export const Hexagon = ({
  children,
  size = 100,
  cornerRadius,
  pointy = true,
  color = "currentColor",
  borderColor = "transparent",
  borderWidth = 0,
  className = "",
  ...props
}: HexagonProps) => {
  const { pathData, effectiveSize } = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    // 線の太さを考慮した半径
    const R = (size - borderWidth) / 2 - 2;

    const maxRadius = (R * Math.sqrt(3)) / 2;
    // 明示的な指定がない場合は size の 12% をデフォルト値とする
    const effectiveCornerRadius = cornerRadius !== undefined ? cornerRadius : size * 0.12;
    const r = Math.min(Math.max(0, effectiveCornerRadius), maxRadius);
    const offset = pointy ? -Math.PI / 2 : 0; // 上 を頂点にするための調整


    const getPoint = (i: number) => {
      const angle = offset + (i % 6) * (Math.PI / 3);
      return { 
        x: cx + R * Math.cos(angle), 
        y: cy + R * Math.sin(angle) 
      };
    };

    let path = "";
    const d = r / Math.sqrt(3);
    const ratio = d / R;

    for (let i = 0; i < 6; i++) {
      const vPrev = getPoint((i + 5) % 6);
      const v = getPoint(i);
      const vNext = getPoint((i + 1) % 6);

      if (r === 0) {
        path += i === 0 ? `M ${v.x},${v.y} ` : `L ${v.x},${v.y} `;
      } else {
        const pIn = {
          x: v.x + (vPrev.x - v.x) * ratio,
          y: v.y + (vPrev.y - v.y) * ratio,
        };
        const pOut = {
          x: v.x + (vNext.x - v.x) * ratio,
          y: v.y + (vNext.y - v.y) * ratio,
        };

        path += i === 0 ? `M ${pIn.x},${pIn.y} ` : `L ${pIn.x},${pIn.y} `;
        path += `A ${r},${r} 0 0,1 ${pOut.x},${pOut.y} `;
      }
    }
    
    path += "Z";
    
    return { 
      pathData: path,
      effectiveSize: {
        width: pointy ? size * HEX_CONSTANTS.POINTY_W_TO_H : size,
        height: pointy ? size : size * HEX_CONSTANTS.FLAT_H_TO_W
      }
    };
  }, [size, cornerRadius, pointy, borderWidth]);

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ 
        width: effectiveSize.width, 
        height: effectiveSize.height,
        // コンテナ自体も六角形に近い形にしてヒットエリアを調整
        clipPath: pointy 
          ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
          : "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
      }}
      {...props}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`${(size - effectiveSize.width) / 2} 0 ${effectiveSize.width} ${effectiveSize.height}`}
        preserveAspectRatio="xMidYMid meet"
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
        <div className="relative z-10 flex items-center justify-center w-full h-full p-[10%]">
          {children}
        </div>
      )}
    </div>
  );
};
