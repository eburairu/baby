# 授乳記録機能 仕様書 (Breastfeeding Tracker Specification)

## 概要

赤ちゃんの授乳（母乳・ミルク）を記録・管理するためのフロントエンド機能。
授乳時間（母乳）や摂取量（ミルク）を記録し、赤ちゃんの栄養摂取状況や授乳リズム（間隔）を把握するのに役立てる。

## ユーザーストーリー

- 親として、授乳（母乳）の開始・終了時間を簡単に記録したい（授乳中または授乳直後に）。
- 粉ミルクや搾母乳をあげた場合、その量 (ml) を記録したい。
- 前回の授乳からどれくらい時間が経ったかを確認し、次の授乳タイミングの目安にしたい。
- 1日の授乳回数や合計授乳時間、ミルクの合計量を確認したい。
- 母乳の場合、左右どちらの乳房から授乳したかを記録したい。
- 前回どちらの乳房から授乳したかを確認し、次回の開始側の参考にしたい。
- ボトル授乳の際、粉ミルクか搾母乳かを区別して記録したい。
- 赤ちゃんがしっかり飲んだか途中でやめたかを記録したい。

## 機能要件

### F1: 授乳記録入力

- **種類選択**:
    - 🤱 母乳 (BREAST)
    - 🍼 ミルク (BOTTLE) - 粉ミルク・搾母乳を区別して記録可能
- **入力項目**:
    - **母乳の場合**:
        - **左右別タイマー（新規・HIGH）**: 左乳・右乳それぞれに独立したタイマーを持つ。片方を起動するともう一方は自動停止。
        - **左右別手動入力（新規・HIGH）**: `左: [ X ] 分 / 右: [ Y ] 分` で入力可能。
        - **合計時間の自動計算（新規・HIGH）**: 左右の合計を `duration_minutes` として自動計算して保存（後方互換性維持）。
        - 手動メモで代替していた「右のみ」「左のみ」の記述が不要になる。
    - **ミルクの場合**:
        - 量 (ml): 10ml単位などで入力。
        - **ボトルコンテンツタイプ（新規・MEDIUM）**: 「粉ミルク / 搾母乳 / 混合」をラジオボタンで選択。
    - **共通**:
        - 時刻: デフォルトは「現在時刻」。過去分の入力も可能。
        - **授乳完全度（新規・MEDIUM）**: 「しっかり飲んだ / 途中でやめた」のトグル選択。
        - メモ: 自由記述。
- **保存**: API に POST して保存する。

### F2: 授乳記録一覧 (タイムライン)

- 直近の記録を時系列（新しい順）で表示。
- 各記録の表示内容:
    - 時刻
    - 種類アイコン (🤱 / 🍼)
    - 内容:
        - 母乳: `left_breast_minutes` がある場合は `左: 8分 / 右: 7分 (合計15分)` のように左右別で表示。旧データは `duration_minutes` で従来通り表示。
        - ミルク: `100ml (搾母乳)` のようにコンテンツタイプを表示。
    - **授乳完全度バッジ（新規・MEDIUM）**: `[しっかり飲んだ]` / `[途中でやめた]` を表示（設定がある場合のみ）。
    - **記録者名**: `recorded_by_display_name` を表示（例：「ママ」「パパ」）。`null`（削除済みユーザー）の場合は表示省略または「不明」と表示。
    - メモ（あれば）
- 記録の削除機能。

### F3: 統計サマリー (Daily)

- **今日の合計**:
    - 授乳回数
    - 母乳合計時間 (分)
    - ミルク合計量 (ml)
    - **左右別今日の合計（新規・HIGH）**: `今日の母乳内訳: 左 45分 / 右 45分`
- **前回からの経過時間**:
    - 最後の授乳記録からの経過時間を表示（「前回から 2時間 30分」など）。
- **最終授乳側の表示（新規・HIGH）**: 前回の記録から `last_breast_side` を取得し「前回: 右から授乳」を表示。
- **次回ガイドメッセージ（新規・HIGH）**: 最後の授乳側に基づき「次回は左から始めましょう」を表示。

## 画面構成

### 授乳記録ページ (`/feeding`)

ダッシュボード内のサブページ。

```
┌─────────────────────────────────────────────┐
│  [統計サマリー カード]                         │
│  今日: 🤱 6回 (90分)                          │
│        🍼 2回 (200ml)                         │
│        母乳内訳: 左45分 / 右45分              │
│                                              │
│  前回: 2h 15m前 (🤱 右から授乳)              │
│  💡 次回は左から始めましょう                   │
├─────────────────────────────────────────────┤
│  [入力フォーム]                               │
│  タブ: [ 🤱 母乳 ]  [ 🍼 ミルク ]             │
│                                              │
│  (母乳タブ選択時)                             │
│  ┌────────────────────────────────────────┐  │
│  │  [左乳]              [右乳]            │  │
│  │  ┌─────────────────┐  ┌─────────────┐ │  │
│  │  │   03:45         │  │   01:30     │ │  │
│  │  │ [ ⏸ 計測中 ]    │  │ [ ▶ 開始 ] │ │  │
│  │  └─────────────────┘  └─────────────┘ │  │
│  │  合計: 5分 15秒                        │  │
│  │  手動: 左[ 4 ]分  右[ 1 ]分           │  │
│  │  授乳完全度: [● しっかり] [○ 途中]    │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  (ミルクタブ選択時)                           │
│    種類: [● 粉ミルク] [○ 搾母乳] [○ 混合]    │
│    量: [ 100 ] ml                            │
│    授乳完全度: [● しっかり] [○ 途中]          │
│                                              │
│  時刻: [ 2026/02/13 17:30 ]                  │
│  メモ: [                                 ]   │
│                                              │
│        [ 記録する (Save) ]                   │
├─────────────────────────────────────────────┤
│  最近の記録                                   │
│  ──────────────────────────────────          │
│  15:15  🤱 母乳  左: 8分 / 右: 7分 (合計15分) │
│         [しっかり飲んだ]  👤 ママ              │
│  12:00  🍼 ミルク  100ml (搾母乳)  👤 パパ    │
│  ...                                         │
└─────────────────────────────────────────────┘
```

## バックエンド API / データモデル

既存の `Feeding` モデルおよび API を利用し、新規フィールドを追加する。

### Enum 定義

```python
class BreastSide(str, Enum):
    LEFT = "LEFT"
    RIGHT = "RIGHT"
    BOTH = "BOTH"

class BottleContentType(str, Enum):
    FORMULA = "FORMULA"           # 粉ミルク
    EXPRESSED_MILK = "EXPRESSED_MILK"  # 搾母乳
    MIXED = "MIXED"               # 混合

class FeedingCompletion(str, Enum):
    FULL = "FULL"        # しっかり飲んだ
    PARTIAL = "PARTIAL"  # 途中でやめた
```

### モデル (`Feeding`)

既存フィールド:
- `feeding_type`: `BREAST` | `BOTTLE` | `MIXED`
- `feeding_time`: 日時
- `duration_minutes`: 授乳時間（分）— **後方互換性のため削除しない**
- `amount_ml`: ミルク量 (ミルクの場合に使用)
- `notes`: メモ

新規フィールド:

| フィールド | 型 | 用途 | 優先度 |
|---|---|---|---|
| `left_breast_minutes` | Integer, nullable | 左乳の授乳時間（分） | HIGH |
| `right_breast_minutes` | Integer, nullable | 右乳の授乳時間（分） | HIGH |
| `last_breast_side` | Enum(BreastSide), nullable | 最後に授乳した側 | HIGH |
| `bottle_content_type` | Enum(BottleContentType), nullable | ボトルの中身種別 | MEDIUM |
| `feeding_completion` | Enum(FeedingCompletion), nullable | 授乳完全度 | MEDIUM |

### 互換性方針

- `duration_minutes` は削除しない（旧データ・既存統計ロジックとの後方互換性維持）。
- 新フィールドはすべて `nullable=True`。
- バックエンドで `left_breast_minutes` と `right_breast_minutes` が両方指定された場合、`duration_minutes = left_breast_minutes + right_breast_minutes` を自動計算してセット。

### API

- `GET /api/feedings/?baby_id={id}`
- `POST /api/feedings/`
- `PATCH /api/feedings/{id}` — 既存実装済み
- `DELETE /api/feedings/{id}`

### リクエストスキーマ (`FeedingCreate`)

```typescript
{
  baby_id: number,
  feeding_time: string,                // ISO 8601
  feeding_type: "BREAST" | "BOTTLE" | "MIXED",
  amount_ml?: number,                  // ボトル授乳時の量
  duration_minutes?: number,           // 後方互換性のため残存
  left_breast_minutes?: number,        // 新規（HIGH）左乳の授乳時間
  right_breast_minutes?: number,       // 新規（HIGH）右乳の授乳時間
  last_breast_side?: "LEFT" | "RIGHT" | "BOTH",             // 新規（HIGH）
  bottle_content_type?: "FORMULA" | "EXPRESSED_MILK" | "MIXED", // 新規（MEDIUM）
  feeding_completion?: "FULL" | "PARTIAL",                   // 新規（MEDIUM）
  notes?: string
}
```

### レスポンススキーマ (`FeedingResponse`)

```typescript
interface FeedingResponse {
  id: number
  baby_id: number
  user_id: number
  feeding_time: string
  feeding_type: "BREAST" | "BOTTLE" | "MIXED"
  amount_ml: number | null
  duration_minutes: number | null
  left_breast_minutes: number | null
  right_breast_minutes: number | null
  last_breast_side: "LEFT" | "RIGHT" | "BOTH" | null
  bottle_content_type: "FORMULA" | "EXPRESSED_MILK" | "MIXED" | null
  feeding_completion: "FULL" | "PARTIAL" | null
  notes: string | null
  recorded_by_display_name: string | null  // 記録者の表示名（ユーザーが削除された場合はnull）
}
```

## 技術設計

### コンポーネント構成案

- `FeedingPage` (`app/(dashboard)/feeding/page.tsx`)
- `FeedingForm`
    - `BreastFeedingInput`: 左右独立タイマー対応に変更
    - `BottleFeedingInput`: 量入力＋コンテンツタイプ選択
- `FeedingStats`: サマリー表示（次回ガイド含む）
- `FeedingHistory`: 履歴リスト

### 状態管理

- タイマーの状態はクライアントサイド (React State) で管理。
- 左右タイマー: `leftTimerSeconds`, `rightTimerSeconds`, `activeBreastSide` の3 state で制御。
    - `activeBreastSide`: `"LEFT" | "RIGHT" | null`
    - 片方のタイマーを起動する際、もう一方が動いていれば自動停止する。
- ページ遷移でリセットされることを許容するか、`localStorage` で永続化するかは実装時に検討。
- データ取得は SWR (`useSWR`) を利用。

### フロントエンド型の更新

```typescript
// types/feeding.ts の FeedingSummary に追加
interface FeedingSummary {
  // 既存フィールド...
  last_breast_side: "LEFT" | "RIGHT" | "BOTH" | null  // 新規（HIGH）
  today_left_duration: number   // 新規（HIGH）今日の左乳合計時間（分）
  today_right_duration: number  // 新規（HIGH）今日の右乳合計時間（分）
}
```

## 実装フェーズ

### フェーズ 1（HIGH優先）

1. DBマイグレーション: `left_breast_minutes`, `right_breast_minutes`, `last_breast_side` フィールドを `Feeding` テーブルに追加
2. バックエンド: Pydanticスキーマ・APIの更新（新フィールドの受け取り、`duration_minutes` 自動計算）
3. フロントエンド:
    - `BreastFeedingInput` を左右独立タイマー対応に変更
    - `FeedingStats` に最終授乳側・次回ガイドメッセージを追加
    - `FeedingHistory` の表示を左右別表示に対応

### フェーズ 2（MEDIUM優先）

1. DBマイグレーション: `bottle_content_type`, `feeding_completion` フィールドを追加
2. バックエンド: スキーマ更新
3. フロントエンド:
    - `BottleFeedingInput` にコンテンツタイプ選択（粉ミルク/搾母乳/混合）を追加
    - 共通フォームに授乳完全度トグルを追加
    - `FeedingHistory` に授乳完全度バッジを追加

### フェーズ 3（LOW優先・将来検討）

- 搾乳（pumping）記録の独立したトラッキング機能
- 赤ちゃんの反応フラグ（機嫌が悪かった等）
- 授乳リマインダー通知
