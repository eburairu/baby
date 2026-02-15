'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ContractionRecord } from '@/types/contraction';
import { useContractionTimer } from '@/stores/contractionStore';

interface ContractionWaveGraphProps {
  contractions: ContractionRecord[];
}

export default function ContractionWaveGraph({ contractions }: ContractionWaveGraphProps) {
  const { status, elapsedSeconds } = useContractionTimer();
  const isTiming = status === 'timing';

  // スケール定数
  const SEC_WIDTH = 0.4; // 1秒あたりの幅(px) - 1500秒(25分)で600px
  const MAX_HEIGHT = 100; // 波の最大高さ(px)
  const VIEWBOX_WIDTH = 600;
  const VIEWBOX_HEIGHT = 160;
  const BASELINE_Y = 140;

  // 描画データの計算
  const wavePaths = useMemo(() => {
    // 最新の基準時間を決定
    let rightmostTime = new Date().getTime();
    
    if (contractions.length > 0) {
        const sorted = [...contractions].sort((a, b) => 
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        const lastRecord = sorted[sorted.length - 1];
        const lastEndTime = lastRecord.end_time 
            ? new Date(lastRecord.end_time).getTime() 
            : new Date().getTime();
        
        // 計測中なら「今」を右端にする。そうでなければ最新の記録の終了時刻。
        rightmostTime = isTiming ? new Date().getTime() : lastEndTime;

        return sorted.map((rec) => {
            const startTime = new Date(rec.start_time).getTime();
            const endTime = rec.end_time ? new Date(rec.end_time).getTime() : new Date().getTime();
            const duration = (endTime - startTime) / 1000;
            
            const endX = VIEWBOX_WIDTH - 20 - (rightmostTime - endTime) / 1000 * SEC_WIDTH;
            const startX = endX - duration * SEC_WIDTH;
            
            const width = duration * SEC_WIDTH;
            const height = Math.min((duration / 60) * MAX_HEIGHT, MAX_HEIGHT * 1.2);
            
            const path = `
                M ${startX} ${BASELINE_Y}
                C ${startX + width * 0.3} ${BASELINE_Y - height}, 
                ${endX - width * 0.3} ${BASELINE_Y - height}, 
                ${endX} ${BASELINE_Y}
            `;
            
            return { 
                id: rec.id, 
                d: path, 
                startX,
                endX,
                duration 
            };
        }).filter(w => w.endX > -100);
    }
    return [];
  }, [contractions, isTiming]);

  // 計測中の「今」の波
  const activeWave = useMemo(() => {
    if (!isTiming) return null;
    
    const duration = elapsedSeconds;
    const endX = VIEWBOX_WIDTH - 20;
    const startX = endX - duration * SEC_WIDTH;
    const width = duration * SEC_WIDTH;
    const height = Math.min((duration / 60) * MAX_HEIGHT, MAX_HEIGHT * 1.2);

    const path = `
        M ${startX} ${BASELINE_Y}
        C ${startX + width * 0.3} ${BASELINE_Y - height}, 
          ${endX - width * 0.3} ${BASELINE_Y - height}, 
          ${endX} ${BASELINE_Y}
    `;

    return { d: path, startX, endX };
  }, [isTiming, elapsedSeconds]);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-4 overflow-hidden relative border border-gray-100 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">陣痛波形 (Waveform)</h3>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] ${isTiming ? 'animate-pulse' : ''}`}></div>
                <span className="text-[10px] text-gray-400">{isTiming ? '計測中' : '陣痛'}</span>
            </div>
            <div className="flex items-center gap-1">
                <div className="w-2 h-0.5 bg-blue-400"></div>
                <span className="text-[10px] text-gray-400">間隔</span>
            </div>
        </div>
      </div>
      
      {/* SVG Canvas */}
      <div className="relative h-32 w-full">
        <svg 
            className="w-full h-full" 
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
        >
            <defs>
            <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
            </linearGradient>
            
            <linearGradient id="activeWaveGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            </defs>

            <line 
                x1="0" y1={BASELINE_Y} x2={VIEWBOX_WIDTH} y2={BASELINE_Y} 
                stroke="currentColor" 
                className="text-gray-200 dark:text-zinc-800" 
                strokeWidth="1" 
                strokeDasharray="4 4"
            />

            {/* 過去の波 */}
            {wavePaths.map((wave, index) => (
            <g key={wave.id}>
                <motion.path
                d={wave.d}
                fill="url(#waveGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                />
                <motion.path
                d={wave.d}
                fill="none"
                stroke="#f87171"
                strokeWidth="2"
                filter="url(#glow)"
                strokeLinecap="round"
                />
            </g>
            ))}

            {/* 凪（間隔）のライン描画 */}
            {wavePaths.map((wave, index) => {
                if (index === 0) return null;
                const prevWave = wavePaths[index - 1];
                return (
                    <line
                        key={`interval-${wave.id}`}
                        x1={prevWave.endX}
                        y1={BASELINE_Y}
                        x2={wave.startX}
                        y2={BASELINE_Y}
                        stroke="#60a5fa"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="opacity-40"
                    />
                );
            })}

            {/* 現在計測中の波 */}
            <AnimatePresence>
            {activeWave && (
                <g>
                    <motion.path
                        key="active-fill"
                        d={activeWave.d}
                        fill="url(#activeWaveGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ 
                            opacity: [0.6, 0.9, 0.6],
                        }}
                        transition={{ 
                            opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                        }}
                    />
                    <motion.path
                        key="active-stroke"
                        d={activeWave.d}
                        fill="none"
                        stroke="#fb7185"
                        strokeWidth="3"
                        filter="url(#glow)"
                        strokeLinecap="round"
                    />
                </g>
            )}
            </AnimatePresence>
        </svg>
      </div>
      
      <div className="mt-2 flex justify-between text-[10px] text-gray-400 dark:text-zinc-500 px-2">
        <span>過去</span>
        <span>現在</span>
      </div>
    </div>
  );
}
