---
phase: 06-frontend-indicators
plan: 01
subsystem: frontend-utils
tags: [frontend, tdd, red]
dependency-graph:
  requires: [PHASE-05]
  provides: [RESOLVE-THRES-TEST, INDIC-UTIL-TEST]
  affects: []
tech-stack:
  added: []
  patterns: [TDD RED]
key-files:
  created:
    - frontend/__tests__/thresholdUtils.test.ts
    - frontend/__tests__/indicatorUtils.test.ts
  modified: []
decisions:
  - WHO ガイドラインに基づく月齢別のデフォルト閾値をテストケースとして定義
  - インジケーターの色の境界値（0.6, 0.8）をテストケースとして定義
metrics:
  duration: 5m
  completed_date: 2026-02-28
---

# Phase 06 Plan 01: thresholdUtils + indicatorUtils TDD RED Summary

## One-liner
WHO ガイドラインに基づく月齢別閾値計算および経過時間インジケーター用ユーティリティの TDD RED テストを実装。

## Overview
本プランでは、Phase 6 (経過時間インジケーター) の実装に先立ち、主要なロジックを担う 2 つのユーティリティ関数に対するテストを記述しました。

1. **thresholdUtils (`resolveThreshold`)**:
   - 月齢に応じた授乳・オムツ替えの推奨間隔を返す
   - 家族設定などでカスタム値が設定されている場合はそれを優先する
   - WHO ガイドライン等の基準値をデフォルトとして持つ

2. **indicatorUtils (`calcProgress`, `getIndicatorColor`, `isOverThreshold`)**:
   - 最終記録からの経過時間と閾値に基づき、進行度 (0.0〜) を計算する
   - 進行度に応じて表示色 (green, yellow, red) を決定する
   - 閾値超過判定を行う

現在は実装ファイル (`frontend/lib/thresholdUtils.ts`, `frontend/lib/indicatorUtils.ts`) が存在しないため、全てのテストが期待通り FAIL (モジュール未解決) している状態です。

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED
- [x] frontend/__tests__/thresholdUtils.test.ts が存在し、16件以上のテストが記述されている
- [x] frontend/__tests__/indicatorUtils.test.ts が存在し、17件以上のテストが記述されている
- [x] 両テストを実行すると全件 FAIL することを確認
- [x] テストファイルが git コミット済み (hash: e8c9873)
