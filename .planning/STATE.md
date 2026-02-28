# プロジェクト・ステータス: Milestone v1.2

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-28)

**Core value:** 家族全員が同じ記録を見ながら育児を分担できる
**Current focus:** Phase 5 — バックエンド閾値API

## Current Position

Phase: 5 of 7 (バックエンド閾値API)
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-02-28 — 05-01 TDD RED フェーズ完了

Progress: [█░░░░░░░░░] 10% (v1.2)

## Performance Metrics

**Velocity:**
- Total plans completed: 1 (v1.2)
- Average duration: 2 min
- Total execution time: 2 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 5 | 1/2 | 2 min | 2 min |
| 6 | 0/? | — | — |
| 7 | 0/? | — | — |

## Accumulated Context

### アーキテクチャ知見

- ハニカムUI: `Hexagon` コンポーネント (SVG path) が中心。`HexagonWidgetCard` が `Hexagon` をラップ
- ウィジェットは `BaseWidgetProps` を受け取り、`records` から計算して表示
- ダッシュボードページ (`dashboard/page.tsx`) が `selectedBaby` を持ちウィジェットに渡す
- 赤ちゃんデータ: `babies[].birthday` から `calcAge()` で月齢を取得
- 閾値保存先: Babyプロフィール（家族共有のためバックエンド必須）

### Phase 5 実装方針

- Babyスキーマ拡張: `feeding_threshold_minutes` と `diaper_threshold_minutes` (nullable int)
- マイグレーション後 openapi.json の更新必須
- バックエンド変更後: `npm run schema:generate && git add frontend/openapi.json`

### 注意点

- TDD 必須: テスト先 → 実装 → Green → リファクタリング
- `verify_all.sh` は PR 前必須（静的エクスポートビルドチェック含む）
- フロントエンドは Static Export — SSR/Server Components 不可

### 決定事項

- THRES-03 クロスユーザー共有検証はバックエンドテストでなく Phase 7 統合テストで行う（05-01 にて決定）

## Session Continuity

Last session: 2026-02-28
Stopped at: 05-01-PLAN.md 完了（TDD RED フェーズ）、05-02-PLAN.md（実装フェーズ）待ち
Resume file: None
