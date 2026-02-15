'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { ContractionRecord } from '@/types/contraction';
import { useContractionTimer } from '@/stores/contractionStore';

interface ContractionWaveGraphProps {
  contractions: ContractionRecord[];
}

interface ChartPoint {
  timestamp: number;
  value: number;
  isPeak?: boolean;
  recordId?: number;
  duration?: number;
  interval?: number;
  startTime?: string;
  endTime?: string;
}

export default function ContractionWaveGraph({ contractions }: ContractionWaveGraphProps) {
  const { status, elapsedSeconds, startTime: activeStartTime } = useContractionTimer();
  const isTiming = status === 'timing';

  const chartData = useMemo(() => {
    const points: ChartPoint[] = [];
    const now = Date.now();
    const oneHourAgo = now - 3600 * 1000;

    // 1. 過去の記録を変換
    const sorted = [...contractions].sort((a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    sorted.forEach((rec) => {
      const start = new Date(rec.start_time).getTime();
      const end = rec.end_time ? new Date(rec.end_time).getTime() : start + (rec.duration_seconds || 0) * 1000;

      if (end < oneHourAgo) return;

      const duration = rec.duration_seconds || (end - start) / 1000;
      const interval = rec.interval_seconds || undefined;
      const peakValue = Math.min((duration / 60) * 100, 120); // 60秒で100, 最大120

      // 波を作るための3点プロット
      // 開始点
      points.push({ timestamp: start - 1000, value: 0 });
      // ピーク点
      points.push({
        timestamp: start + (duration * 500),
        value: peakValue,
        isPeak: true,
        recordId: rec.id,
        duration,
        interval,
        startTime: rec.start_time,
        endTime: rec.end_time || undefined
      });
      // 終了点
      points.push({ timestamp: end + 1000, value: 0 });
    });

    // 2. 現在計測中の波
    if (isTiming && activeStartTime) {
      const start = activeStartTime.getTime();
      const duration = elapsedSeconds;
      const peakValue = Math.min((duration / 60) * 100, 120);

      // 開始点
      points.push({ timestamp: start - 1000, value: 0 });
      // 現在のピーク（リアルタイムに膨らむ）
      points.push({
        timestamp: Date.now(),
        value: peakValue,
        isPeak: true,
        duration,
        startTime: activeStartTime.toISOString()
      });
    }

    // タイムスタンプ順にソートし、重複を排除
    return points.sort((a, b) => a.timestamp - b.timestamp);
  }, [contractions, isTiming, elapsedSeconds, activeStartTime]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartPoint;
      if (!data.isPeak) return null;

      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-2 rounded-lg shadow-lg text-[10px]">
          <p className="font-bold text-red-500 dark:text-red-400 mb-1">
            持続時間: {Math.floor(data.duration! / 60)}分{data.duration! % 60}秒
          </p>
          {data.interval && (
            <p className="text-blue-500 dark:text-blue-400 font-medium">
              間隔: {Math.floor(data.interval / 60)}分{data.interval % 60}秒
            </p>
          )}
          <p className="text-gray-500 dark:text-zinc-400">
            開始: {format(new Date(data.startTime!), 'HH:mm:ss')}
          </p>
          {data.endTime && (
            <p className="text-gray-500 dark:text-zinc-400">
              終了: {format(new Date(data.endTime), 'HH:mm:ss')}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

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
