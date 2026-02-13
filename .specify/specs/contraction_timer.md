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
- 5-1-1ルール判定:
  - 陣痛間隔が 5分以下
  - 持続時間が 1分以上
  - 上記が 1時間以上続く
  → 条件を満たした場合、アラートバナーを表示

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
│     [ 陣痛が終わった ]           │
│     (計測中...)                  │
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
- `GET /api/contractions/?baby_id={id}` - 陣痛記録一覧取得
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
- `ContractionStats` - 統計サマリー
- `ContractionHistory` - 記録一覧
