---
phase: 06-frontend-indicators
plan: 03
subsystem: frontend
tags: [ui, indicators, svg, dashboard]
requirements: [INDIC-01, INDIC-02, INDIC-03, INDIC-04]
tech-stack: [next.js, tailwind, svg]
key-files:
  - frontend/components/ui/HexagonProgressArc.tsx
  - frontend/components/dashboard/HexagonWidgetCard.tsx
dependency-graph:
  requires: [06-01, 06-02]
  provides: [INDICATOR_UI]
  affects: [FeedingWidget, SleepWidget, DiaperWidget]
decisions:
  - "HexagonProgressArc は Hexagon の clip-path の外側に重ねる SVG オーバーレイとして実装。Hexagon.tsx のパス計算ロジックと同期させた。"
  - "isSkeleton, isLoading, isError の状態ではインジケーターを表示しないよう HexagonWidgetCard で制御。"
metrics:
  duration: 15m
  tasks: 2
  files: 2
---

# Phase 06 Plan 03: HexagonProgressArc UI 実装 Summary

## One-liner
HexagonProgressArc SVG コンポーネントを新規作成し、HexagonWidgetCard に統合して経過時間インジケーターの UI 基盤を構築しました。

## 実装内容

### 1. HexagonProgressArc.tsx の新規作成 (INDIC-01, INDIC-02, INDIC-03, INDIC-04)
- **SVG ストローク描画:** `stroke-dasharray` と `pathLength="1"` を使用して、0から1の `progress` に応じた六角形外周の描画を実現。
- **パス計算:** `hexagon.tsx` の角丸六角形計算ロジックを継承し、インジケーターが六角形の枠に正確に沿うように実装。
- **動的カラー:** `indicatorUtils` の `getIndicatorColor` を使用して、緑・黄・赤の色変化を適用。
- **点滅アニメーション:** `isOverThreshold=true` の場合に Tailwind の `animate-pulse` を適用し、緊急性を視覚的に通知。

### 2. HexagonWidgetCard.tsx への統合
- **Props 追加:** `indicatorProgress` (number) と `isOverThreshold` (boolean) を追加。
- **条件付きレンダリング:** データの読み込み完了後かつエラーがない場合のみ `HexagonProgressArc` を表示。
- **配置:** `absolute` 配置により、既存の六角形背景とコンテンツの上に重なるように調整。

## 変更ファイル
- `frontend/components/ui/HexagonProgressArc.tsx` (新規)
- `frontend/components/dashboard/HexagonWidgetCard.tsx` (変更)

## 検証結果
- **ビルドチェック:** `pnpm build` が正常に完了（静的エクスポート互換性確認）。
- **テスト:** `vitest` により `indicatorUtils` 等のロジックが正常であることを確認。
- **UI コンポーネント:** 型定義が正しく、既存のウィジェット（FeedingWidget等）で `indicatorProgress` を渡せる状態になった。

## Deviations from Plan
なし。プラン通りに実装を完了しました。

## Self-Check: PASSED
- [x] HexagonProgressArc.tsx が存在し、パス計算が正しい
- [x] HexagonWidgetCard がインジケーター Props を受け取りレンダリングする
- [x] pnpm build でコンパイルエラーがない
- [x] 変更が git commit されている
