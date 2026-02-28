# プロジェクト・ステータス: Milestone v1.2

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-28)

**Core value:** 家族全員が同じ記録を見ながら育児を分担できる
**Current focus:** Phase 5 — バックエンド閾値API

## Current Position

Phase: 5 of 7 (バックエンド閾値API)
Plan: — of ? in current phase
Status: Ready to plan
Last activity: 2026-02-28 — v1.2 ロードマップ作成

Progress: [░░░░░░░░░░] 0% (v1.2)

## Performance Metrics

**Velocity:**
- Total plans completed: 0 (v1.2)
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 5 | 0/? | — | — |
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

## Session Continuity

Last session: 2026-02-28
Stopped at: ロードマップ作成完了、Phase 5 の plan-phase 待ち
Resume file: None
