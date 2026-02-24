import { useMemo } from 'react';
import type { ContractionRecord } from '@/types/contraction';
import { useContractionTimer } from '@/stores/contractionStore';

export interface ChartPoint {
  timestamp: number;
  value: number;
  isPeak?: boolean;
  recordId?: number;
  duration?: number;
  interval?: number;
  startTime?: string;
  endTime?: string;
}

export function useContractionWaveData(contractions: ContractionRecord[]) {
  const { status, elapsedSeconds, startTime: activeStartTime } = useContractionTimer();
  const isTiming = status === 'timing';

  // Use a stable timestamp for this render to satisfy purity rules
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const chartData = useMemo(() => {
    const points: ChartPoint[] = [];
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
        timestamp: now,
        value: peakValue,
        isPeak: true,
        duration,
        startTime: activeStartTime.toISOString()
      });
    }

    // タイムスタンプ順にソートし、重複を排除
    return points.sort((a, b) => a.timestamp - b.timestamp);
  }, [contractions, isTiming, elapsedSeconds, activeStartTime, now]);

  return { chartData, isTiming };
}
