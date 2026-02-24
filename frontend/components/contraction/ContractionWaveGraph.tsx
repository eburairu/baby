'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import type { ContractionRecord } from '@/types/contraction';
import { useContractionWaveData, ChartPoint } from '@/hooks/contraction/useContractionWaveData';

interface ContractionWaveGraphProps {
  contractions: ContractionRecord[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data.isPeak) return null;

    return (
      <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-2 rounded-lg shadow-lg text-[10px]">
        <p className="font-bold text-red-500 dark:text-red-400 mb-1">
          持続時間: {Math.floor(data.duration! / 60)}分{data.duration! % 60}秒
        </p>
        {data.interval ? (
          <p className="text-blue-500 dark:text-blue-400 font-medium">
            間隔: {Math.floor(data.interval / 60)}分{data.interval % 60}秒
          </p>
        ) : null}
        <p className="text-gray-500 dark:text-zinc-400">
          開始: {format(new Date(data.startTime!), 'HH:mm:ss')}
        </p>
        {data.endTime ? (
          <p className="text-gray-500 dark:text-zinc-400">
            終了: {format(new Date(data.endTime), 'HH:mm:ss')}
          </p>
        ) : null}
      </div>
    );
  }
  return null;
};

export default function ContractionWaveGraph({ contractions }: ContractionWaveGraphProps) {
  const { chartData, isTiming } = useContractionWaveData(contractions);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-4 overflow-hidden relative border border-gray-100 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">陣痛波形 (Waveform)</h3>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] ${isTiming ? 'animate-pulse' : ''}`}></div>
                <span className="text-[10px] text-gray-400">{isTiming ? '計測中' : '陣痛'}</span>
            </div>
        </div>
      </div>

      <div className="h-40 w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['auto', 'auto']}
              hide
            />
            <YAxis hide domain={[0, 150]} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#f87171"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#waveGradient)"
              isAnimationActive={!isTiming} // 計測中はリアルタイム更新を優先
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between text-[10px] text-gray-400 dark:text-zinc-500 mt-1 px-1">
        <span>過去</span>
        <span className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            現在
        </span>
      </div>
    </div>
  );
}
