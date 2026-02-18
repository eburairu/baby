# 陣痛タイマー機能 仕様書 (Contraction Timer Specification)

## 概要

出産前の陣痛を計測・記録するためのフロントエンド機能。
ストップウォッチ形式で陣痛の開始/終了を記録し、陣痛の持続時間と間隔を自動算出する。
「病院に連絡すべきタイミング」の目安（5-1-1ルール等）をユーザーに通知する。

> **注意**: 陣痛タイマーは出生前の赤ちゃん（`birthday` 未設定）のダッシュボード・ナビゲーションにのみ表示される。出生後は非表示となる。

## ユーザーストーリー

- 妊婦（またはパートナー）として、陣痛開始ボタンを押すだけで計測を開始したい
- 陣痛が終わったらボタンを押して、持続時間を自動記録したい
- 過去の陣痛記録を一覧で確認し、間隔・持続時間の推移を把握したい
- 「5-1-1ルール」に基づき、病院に連絡すべきかの通知を受けたい

## 機能要件

### F1: 陣痛タイマー (ストップウォッチ)

- **開始ボタン**: 陣痛の開始時刻を記録し、経過時間のカウントを開始する
- **1分前から開始ボタン (New)**: 陣痛が既にはじまっている場合に、現在時刻の1分前を `start_time` として記録し計測を開始する（操作遅れをカバーする）
- **停止ボタン**: 陣痛の終了時刻を記録し、持続時間を自動算出する
- **リアルタイム表示**: 経過秒数を `MM:SS` 形式でリアルタイム表示する
- **状態管理**: タイマーの状態（idle / timing）を Zustand ストアで管理する
- **`interval_seconds` 自動計算**: 停止時に「前回の痛みの始まり（start_time）」から「今回の痛みの始まり（start_time）」までの時間を算出する（Start-to-Start / 周期）
    - 計算式: `(今回のstart_time - 前回のstart_time) / 1000`（ミリ秒→秒、Math.round）
    - diff > 0 の場合のみ送信（前回記録がない場合や差分が0以下の場合はフィールド自体を省略）
- **ボタン仕様**: `h-20 w-full text-2xl rounded-2xl`（陣痛中の操作性を考慮して大型化）

### F2: 陣痛記録一覧

- 直近の陣痛記録を一覧表示する（新しい順）
- 各記録に以下を表示:
    - 開始時刻
    - 持続時間（秒 → `M分S秒` 形式）
    - 前回からの間隔（秒 → `M分S秒` 形式）
    - **記録者名**: `recorded_by_display_name` を表示（例：「ママ」「パパ」）。`null`（削除済みユーザー）の場合は表示省略または「不明」と表示。
- **編集機能 (New)**: 記録済みの `start_time`, `end_time`（または `duration_seconds`）, `notes` を編集できる
- **再計算ロジック**:
    - `start_time` を編集した場合、その記録の `interval_seconds` および **「直後の記録（時系列で次）」の `interval_seconds`** を再計算する。
    - `end_time` を編集した場合、`duration_seconds` を再計算する。
- **バリデーション**: `end_time` は必ず `start_time` より後でなければならない。
- 個別の記録を削除できる

### F3: 統計サマリー

- 直近1時間の陣痛回数
- 平均持続時間
- 平均間隔 (痛みの始まりから次の痛みの始まり / Start-to-Start)
- 5-1-1ルール判定（正確なロジック）:
    - qualifying = `interval_seconds ≤ 300` かつ `duration_seconds ≥ 60` の陣痛
    - `shouldAlert = qualifying.length >= 3`
        - かつ `qualifying[qualifying.length - 1].start_time <= now - 3600_000`（最古が1時間以上前）
        - かつ `qualifying[0].start_time >= now - 1800_000`（最新が30分以内）
    - APIは降順（新しい順）のため `qualifying[0]` が最新、`qualifying[qualifying.length - 1]` が最古
  → 条件を満たした場合、アラートバナーを表示

### F4: 陣痛波形グラフ (Waveform UI) - Recharts 版

陣痛を「寄せては返す波」として視覚化し、痛みのピークと休憩のサイクルを直感的に把握できるリッチな波形表示。

- **コンセプト**:
    - **Organic (有機的)**: Recharts の `AreaChart` (type="monotone") を使用し、滑らかな連続曲線を描画。
    - **Interactive (対話的)**: 波の頂点にホバーした際、持続時間や時刻を表示するツールチップを搭載。
    - **Status (状態)**:
        - 波（山）: 陣痛中。赤〜ピンク系のグラデーション。
        - 凪（谷）: 休憩中。ベースライン付近を推移。
- **表示要素**:
    - **X軸 (時間軸)**: 過去から現在への時系列配置。Recharts の `XAxis` を使用。
    - **Y軸 (強度)**:
        - 0 (静止) から 100 (最大強度) までの値。
        - 陣痛中は正規分布的な曲線で上昇・下降させる。
    - **ツールチップ**: 持続時間、前回からの間隔、開始/終了時刻を表示。
- **アニメーション**:
    - Recharts 標準のアニメーションに加え、計測中の最新データポイントを動的に追加し、リアルタイムで波が右端に描画される。
- **技術スタック**:
    - **Recharts** (`AreaChart`, `Area`, `XAxis`, `Tooltip`, `ResponsiveContainer`)
    - **framer-motion** (コンテナ의登場アニメーション等)
- **データ変換ロジック**:
    - 陣痛記録を Recharts 用の時系列配列（`{ time: string, value: number, duration?: number, ... }`）に変換する。
    - 1つの陣痛を複数のデータポイント（開始、ピーク、終了）で表現し、`monotone` 補間によって滑らかな山を作る。
- **スケール計算**:
    - **横幅**: 直近30分〜1時間程度の時間窓をカバー。
    - **高さ**: 持続時間 60秒をピーク強度の基準とする。

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
│  [陣痛波形グラフ (Waveform)]     │
│  波=陣痛中 (赤ネオン)             │
│  凪=間隔 (青紫ライン)             │
├─────────────────────────────────┤
│  陣痛記録                              │
│  ─────────────────────               │
│  14:30  持続: 50秒  間隔: 4分  👤 ママ │
│  14:25  持続: 45秒  間隔: 5分  👤 パパ │
│  ...                             │
└─────────────────────────────────┘
```

## バックエンド API (既存 & 拡張)

以下の API を使用:

- `GET /api/contractions/?baby_id={id}` - 陣痛記録一覧取得
- `POST /api/contractions/` - 陣痛記録作成
- `PATCH /api/contractions/{id}` - 陣痛記録更新 (New)
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

// PATCH リクエスト (New)
interface ContractionUpdate {
  start_time?: string
  end_time?: string
  duration_seconds?: number
  notes?: string
}

// レスポンス
interface ContractionResponse extends ContractionCreate {
  id: number
  user_id: number
  recorded_by_display_name: string | null  // 記録者の表示名（ユーザーが削除された場合はnull）
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
  start: (offsetMs?: number) => void // offsetMs: 過去に遡って開始する場合（例: 1分前なら 60000）
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
- `ContractionWaveGraph` - 陣痛波形グラフ (Waveform UI)

## 改訂履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0 | 初版 | 基本機能仕様 |
| 1.1 | 2026-02-13 | F1に`interval_seconds`自動計算仕様追記、ボタン大型化仕様追記、F3の5-1-1ルールロジック修正、F4「陣痛グラフ」新規追加 |
| 1.2 | 2026-02-15 | 陣痛グラフを「波形UI (Waveform UI)」に一新。ベジェ曲線を用いた滑らかな描画とアニメーション要件を追加。 |
| 1.3 | 2026-02-15 | 波形UIを Recharts ベースにアップグレード。インタラクティブなツールチップ、精緻な曲線補間、レスポンシブ対応を強化。 |
| 1.4 | 2026-02-16 | 「1分前からの計測開始ボタン」および「記録の編集機能」を追加。PATCH API仕様を定義。 |
| 1.5 | 2026-02-16 | 陣痛の間隔の定義を「痛みの始まりから次の痛みの始まり」と明記。 |
| 1.6 | 2026-02-18 | F2に記録者名（`recorded_by_display_name`）の表示要件を追加。レスポンススキーマに同フィールドを追加。 |
