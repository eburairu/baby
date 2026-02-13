# 陣痛タイマー機能 仕様書 (Contraction Timer Specification)

## 概要

出産前の陣痛を計測・記録するためのフロントエンド機能。
ストップウォッチ形式で陣痛の開始/終了を記録し、陣痛の持続時間と間隔を自動算出する。
「病院に連絡すべきタイミング」の目安（5-1-1ルール等）をユーザーに通知する。

## ユーザーストーリー

- 妊婦（またはパートナー）として、陣痛開始ボタンを押すだけで計測を開始したい
- 陣痛が終わったらボタンを押して、持続時間を自動記録したい
- 過去の陣痛記録を一覧で確認し、間隔・持続時間の推移を把握したい
- 「5-1-1ルール」に基づき、病院に連絡すべきかの通知を受けたい

## 機能要件

### F1: 陣痛タイマー (ストップウォッチ)

- **開始ボタン**: 陣痛の開始時刻を記録し、経過時間のカウントを開始する
- **停止ボタン**: 陣痛の終了時刻を記録し、持続時間を自動算出する
- **リアルタイム表示**: 経過秒数を `MM:SS` 形式でリアルタイム表示する
- **状態管理**: タイマーの状態（idle / timing）を Zustand ストアで管理する
- **`interval_seconds` 自動計算**: 停止時に前回記録の `end_time` と今回の `start_time` の差分から算出
    - 計算式: `(今回のstart_time - 前回のend_time) / 1000`（ミリ秒→秒、Math.round）
    - diff > 0 の場合のみ送信（前回記録がない場合や差分が0以下の場合はフィールド自体を省略）
- **ボタン仕様**: `h-20 w-full text-2xl rounded-2xl`（陣痛中の操作性を考慮して大型化）

### F2: 陣痛記録一覧

- 直近の陣痛記録を一覧表示する（新しい順）
- 各記録に以下を表示:
    - 開始時刻
    - 持続時間（秒 → `M分S秒` 形式）
    - 前回からの間隔（秒 → `M分S秒` 形式）
- 個別の記録を削除できる

### F3: 統計サマリー

- 直近1時間の陣痛回数
- 平均持続時間
- 平均間隔
- 5-1-1ルール判定（正確なロジック）:
    - qualifying = `interval_seconds ≤ 300` かつ `duration_seconds ≥ 60` の陣痛
    - `shouldAlert = qualifying.length >= 3`
        - かつ `qualifying[qualifying.length - 1].start_time <= now - 3600_000`（最古が1時間以上前）
        - かつ `qualifying[0].start_time >= now - 1800_000`（最新が30分以内）
    - APIは降順（新しい順）のため `qualifying[0]` が最新、`qualifying[qualifying.length - 1]` が最古
  → 条件を満たした場合、アラートバナーを表示

### F4: 陣痛グラフ

- 直近10件の陣痛を時系列順（古い→新しい）で表示するSVGバーチャート
- 赤バー: `duration_seconds`（持続時間）
- 青バー: `interval_seconds`（間隔）— 2件目以降から表示
- X軸: `start_time` の HH:MM 形式
- Y軸: 秒数（`maxValue` に応じた動的スケール、最低60秒）
- `viewBox` ベースでレスポンシブ（`width="100%"`）
- 外部ライブラリ不使用（純粋SVG実装）
- レイアウト定数: `W=400, H=200, M={top:10, right:10, bottom:40, left:45}`
- 2件以上の記録がある場合のみページで表示

## 画面構成

### 陣痛タイマーページ (`/contraction`)

ダッシュボード内のサブページとして配置する。

```
┌─────────────────────────────────┐
│  [統計サマリー カード]            │
│  回数: 8回 | 平均間隔: 4分30秒    │
│  平均持続: 55秒                  │
│  ⚠️ 病院に連絡してください       │
├─────────────────────────────────┤
│         ⏱ 00:45                 │
│  [ 陣痛が終わった（大型ボタン） ] │
│     (計測中...)                  │
├─────────────────────────────────┤
│  [陣痛推移グラフ]                │
│  赤=持続 青=間隔 （SVGバーチャート）│
├─────────────────────────────────┤
│  陣痛記録                        │
│  ─────────────────────          │
│  14:30  持続: 50秒  間隔: 4分    │
│  14:25  持続: 45秒  間隔: 5分    │
│  14:20  持続: 40秒  間隔: 6分    │
│  ...                             │
└─────────────────────────────────┘
```

## バックエンド API (既存)

以下の API は既に実装済み:

- `GET /api/contractions/?baby_id={id}` - 陣痛記録一覧取得（`order_by(start_time.desc())`で降順）
- `POST /api/contractions/` - 陣痛記録作成
- `DELETE /api/contractions/{id}` - 陣痛記録削除

### リクエスト/レスポンス スキーマ

```typescript
// POST リクエスト
interface ContractionCreate {
  baby_id: number
  start_time: string    // ISO 8601
  end_time?: string     // ISO 8601
  duration_seconds?: number
  interval_seconds?: number
  notes?: string
}

// レスポンス
interface ContractionResponse extends ContractionCreate {
  id: number
  user_id: number
}
```

## 技術設計

### 状態管理 (Zustand)

```typescript
interface ContractionTimerState {
  status: 'idle' | 'timing'
  startTime: Date | null
  elapsedSeconds: number
  // actions
  start: () => void
  stop: () => { startTime: Date; endTime: Date; durationSeconds: number }
  reset: () => void
  tick: () => void
}
```

### データ取得 (SWR)

- `useContractions(babyId)` カスタムフックで陣痛記録を取得
- タイマー停止時にPOSTし、SWRで自動再検証

### コンポーネント構成

- `ContractionPage` - ページコンポーネント
- `ContractionTimer` - タイマーUI（ストップウォッチ）
- `ContractionStats` - 統計サマリー（5-1-1ルール判定含む）
- `ContractionHistory` - 記録一覧
- `ContractionGraph` - 陣痛推移SVGグラフ（新規）

## 改訂履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0 | 初版 | 基本機能仕様 |
| 1.1 | 2026-02-13 | F1に`interval_seconds`自動計算仕様追記、ボタン大型化仕様追記、F3の5-1-1ルールロジック修正（正確な1時間継続判定）、F4「陣痛グラフ」新規追加、ContractionGraphコンポーネント追加 |
