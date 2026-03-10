---
phase: 06-frontend-indicators
plan: 02
subsystem: frontend
tags: [thresholds, indicators, tdd]
dependency_graph:
  requires: [06-01]
  provides: [threshold-utils, indicator-utils]
  affects: [dashboard]
tech_stack: [typescript, vitest]
key_files:
  - frontend/lib/thresholdUtils.ts
  - frontend/lib/indicatorUtils.ts
decisions:
  - WHOガイドラインの月齢ブレイクポイントを下限値で管理するテーブル形式で実装
  - progress 値はクランプせず、1.0 を超える生の比率を返すように実装（点滅判定のため）
metrics:
  duration: 5m
  completed_at: "2026-02-28T14:55:30Z"
---

# Phase 6 Plan 02: 閾値・インジケーター・ユーティリティ実装 Summary

## 概要
Phase 6 Wave 2 として、経過時間インジケーターの表示ロジックをカプセル化したユーティリティ関数群を実装しました。06-01 で作成した TDD テストケースを全てパス（GREEN）させ、安定した共通ロジックを提供します。

## 実装内容

### 1. thresholdUtils.ts
- `resolveThreshold` 関数の実装
  - 赤ちゃんの月齢に基づき、WHO/小児科ガイドラインの標準閾値を返却
  - `customMinutes` が指定されている場合はそちらを優先
  - feeding (授乳) と diaper (おむつ) の両タイプに対応

### 2. indicatorUtils.ts
- `calcProgress`: 前回記録からの経過時間と閾値の比率を計算
- `getIndicatorColor`: 比率に基づき green/yellow/red の色を決定
- `isOverThreshold`: 閾値超過 (>= 1.0) の判定
- `INDICATOR_COLORS`: インジケーターで使用する定数色の定義

## テスト結果 (GREEN)
- `__tests__/thresholdUtils.test.ts`: 16 tests passed
- `__tests__/indicatorUtils.test.ts`: 17 tests passed

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED
- [x] frontend/lib/thresholdUtils.ts exists
- [x] frontend/lib/indicatorUtils.ts exists
- [x] All vitest tests passed
- [x] Commits made for both tasks
