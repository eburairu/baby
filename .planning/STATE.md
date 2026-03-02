---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: タイマー共有
status: defining_requirements
last_updated: "2026-03-02T00:00:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# プロジェクト・ステータス: Milestone v1.3

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-02)

**Core value:** 家族全員が同じ記録を見ながら育児を分担できる
**Current focus:** Milestone v1.3 開始 — 要件定義中

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-02 — Milestone v1.3 started

## Accumulated Context

### アーキテクチャ知見（v1.0〜v1.2 より）

- ハニカムUI: `Hexagon` コンポーネント (SVG path) が中心。`HexagonWidgetCard` が `Hexagon` をラップ
- ウィジェットは `BaseWidgetProps` を受け取り、`records` から計算して表示
- ダッシュボードページ (`dashboard/page.tsx`) が `selectedBaby` を持ちウィジェットに渡す
- 赤ちゃんデータ: `babies[].birthday` から `calcAge()` で月齢を取得
- 閾値保存先: Babyプロフィール（家族共有のためバックエンド必須）
- インジケーター: `HexagonProgressArc` による六角形外周ストローク。`indicatorUtils` で比率・色・超過判定を管理

### タイマー現状（v1.3 対象）

- 陣痛タイマー: `stores/contractionStore.ts` (Zustand) — クライアントのみ。`status`（idle/timing）と `startTime` を管理
- 授乳タイマー: `hooks/useFeedingTimer.ts` (useState/useRef) — クライアントのみ。左右の乳の累積秒数を管理

### 注意点

- TDD 必須: テスト先 → 実装 → Green → リファクタリング
- `verify_all.sh` は PR 前必須（静的エクスポートビルドチェック含む）
- フロントエンドは Static Export — SSR/Server Components 不可
