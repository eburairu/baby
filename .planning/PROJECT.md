# Botoro

## What This Is

Botoro は家族単位で育児記録（授乳・睡眠・おむつ・陣痛・成長など）を共同管理する招待制Webアプリ。
赤ちゃんのいる家族が複数デバイスから同じデータを見ながら育児を分担できる。
FastAPI + PostgreSQL（Neon）バックエンド、Next.js (Static Export) フロントエンド。

## Core Value

家族全員が同じ記録を見ながら育児を分担できる

## Current Milestone: v1.3 タイマー共有

**Goal:** 陣痛タイマー・授乳タイマーの状態を家族間でリアルタイム共有し、別デバイスから操作できる

**Target features:**
- 陣痛タイマーの状態（開始/停止）をバックエンドで管理し、家族間でポーリング同期
- 授乳タイマーの状態（左右・一時停止・累積時間）をバックエンドで管理し、家族間でポーリング同期
- 両タイマーとも baby_id に紐づいて管理される

## Requirements

### Validated

- ✓ ダッシュボードをハニカム構造（六角形タイル）にレイアウト変換 — v1.0/Phase 1-3
- ✓ ダッシュボード上でハニカムウィジェットから赤ちゃん情報（イニシャル・名前・月齢）を確認できる — v1.1/Phase 4
- ✓ ウィジェットタップでポップアップが開き、誕生日・月齢・性別・特徴が表示される — v1.1/Phase 4
- ✓ 授乳・おむつウィジェットの六角形外周に経過時間プログレスインジケーターが表示される — v1.2/Phase 6
- ✓ インジケーターが経過率に応じて緑→黄→赤に変化し、閾値超過時に点滅する — v1.2/Phase 6
- ✓ WHO/小児科ガイドラインに基づく月齢自動閾値が適用される — v1.2/Phase 6
- ✓ 設定画面からカスタム閾値（授乳・おむつ分数）を入力・保存できる — v1.2/Phase 7
- ✓ カスタム閾値がバックエンドに保存され、家族全員が同じ値を参照できる — v1.2/Phase 5

### Active

- [ ] 陣痛タイマーの開始/停止状態をバックエンドで保持し、家族間で数秒以内に同期される
- [ ] 授乳タイマーの開始/一時停止/累積時間をバックエンドで保持し、家族間で数秒以内に同期される
- [ ] タイマー操作（開始・停止・一時停止）が即座にバックエンドに反映される
- [ ] 他のデバイスが操作したタイマー状態をポーリングで取得し、UI に自動反映される

### Out of Scope

- WebSocket によるサブ秒リアルタイム同期 — ポーリング（数秒）で十分。インフラ複雑性を避ける
- プッシュ通知（閾値超過時） — Web Push インフラが必要、v2以降
- 睡眠タイマーの共有 — 睡眠は連続記録で「経過時間」の意味が異なる

## Context

- ハニカムUI: `Hexagon` コンポーネント (SVG path) が中心。`HexagonWidgetCard` が `Hexagon` をラップ
- インジケーター: `HexagonProgressArc` による六角形外周ストローク。`indicatorUtils` で比率・色・超過判定を管理
- 陣痛タイマー: `stores/contractionStore.ts` (Zustand) — 現在クライアントのみ。`status`（idle/timing）と `startTime` を管理
- 授乳タイマー: `hooks/useFeedingTimer.ts` (useState/useRef) — 現在クライアントのみ。左右の乳の時間を管理
- 認証: Cookie ベース HttpOnly セッション。`Family → User → Baby → Records` のデータ階層
- フロントエンドは Static Export — SSR/Server Components 不可
- TDD 必須: テスト先 → 実装 → Green → リファクタリング

## Constraints

- **Tech stack**: FastAPI + PostgreSQL（Neon）+ Next.js Static Export — 変更不可
- **Sync method**: ポーリング（~3秒間隔）— WebSocket は使わない
- **TDD**: 機能実装・バグ修正は必ずテストを先に書く
- **Frontend**: Static Export のため SSR・Server Components は使えない

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ハニカムUI採用 | 独自性と視覚的美しさ | ✓ Good |
| 閾値はBabyプロフィールに保存 | 家族共有のためバックエンド必須 | ✓ Good |
| Static Export（Next.js） | バックエンドが FastAPI で StaticFiles をマウント | ✓ Good |
| タイマー同期はポーリング | WebSocket より実装が単純。数秒の遅延は許容範囲 | — Pending |
| タイマー状態は baby_id に紐づく | 家族内で正しい赤ちゃんの記録に紐づける | — Pending |

---
*Last updated: 2026-03-02 — Milestone v1.3 started*
