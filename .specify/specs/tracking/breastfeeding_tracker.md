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
- 記録済みの内容に誤りがあった場合、後から修正したい。

## 機能要件

### F1: 授乳記録入力

- **種類選択**:
    - 🤱 母乳 (BREAST)
    - 🍼 ミルク (BOTTLE) - 粉ミルク・搾母乳を区別して記録可能
- **入力項目**:
    - **母乳の場合**:
        - **左右別タイマー**: 左乳・右乳それぞれに独立したタイマーを持つ。片方を起動するともう一方は自動停止。**（※新規作成時のみ利用可能。編集時は非表示）**
        - **左右別手動入力**: `左: [ X ] 分 / 右: [ Y ] 分` で入力可能。
        - **合計時間の自動計算**: 左右の合計を `duration_minutes` として自動計算して保存（後方互換性維持）。
    - **ミルクの場合**:
        - 量 (ml): 10ml単位などで入力。
        - **デフォルト値の保持**: ミルク記録時、前回の記録がある場合はその量をデフォルト値として入力欄にセットする。
        - **ボトルコンテンツタイプ**: 「粉ミルク / 搾母乳 / 混合」をラジオボタンで選択。
    - **共通**:
        - 時刻: デフォルトは「現在時刻」。過去分の入力も可能。
        - **授乳完全度**: 「しっかり飲んだ / 途中でやめた」のトグル選択。
        - メモ: 自由記述。
- **保存**: API に POST して保存する。
    - **処理中フィードバック**: 保存ボタンが押された後、API レスポンスが返るまでの間、ボタンを無効化（Disabled）し、「保存中...」およびスピナーを表示して処理中であることを示す。

### F2: 授乳記録一覧 (タイムライン)

- 直近の記録を時系列（新しい順）で表示。
- 各記録の表示内容:
    - 時刻
    - 種類アイコン (🤱 / 🍼)
    - 内容:
        - 母乳: `left_breast_minutes` がある場合は `左: 8分 / 右: 7分 (合計15分)` のように左右別で表示。旧データは `duration_minutes` で従来通り表示。
        - ミルク: `100ml (搾母乳)` のようにコンテンツタイプを表示。
    - **授乳完全度バッジ**: `[しっかり飲んだ]` / `[途中でやめた]` を表示（設定がある場合のみ）。
    - **記録者名**: `recorded_by_display_name` を表示（例：「ママ」「パパ」）。`null`（削除済みユーザー）の場合は表示省略または「不明」と表示。
    - メモ（あれば）
- 記録の削除機能。
    - 削除確認ダイアログを表示し、誤操作を防ぐ。
- 記録の編集機能。
    - 編集アイコンからダイアログを開き、既存の内容を変更可能。

### F3: 統計サマリー (Daily)

- **今日の合計**:
    - 授乳回数
    - 母乳合計時間 (分)
    - ミルク合計量 (ml)
    - **左右別今日の合計**: `今日の母乳内訳: 左 45分 / 右 45分`
- **前回からの経過時間**:
    - 最後の授乳記録からの経過時間を表示（「前回から 2時間 30分」など）。
- **最終授乳情報の表示**:
    - 前回の記録から `last_breast_side` を取得し「前回: 右から授乳」を表示。
    - 前回のミルク記録から `amount_ml` を取得し、次回入力時のデフォルト値として利用する。
- **次回ガイドメッセージ**: 最後の授乳側に基づき「次回は左から始めましょう」を表示。

## データモデル (Feeding)

`app/models/feeding.py` で定義。

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

### モデルフィールド

| フィールド | 型 | 用途 |
|---|---|---|
| `id` | Integer | PK |
| `user_id` | Integer | 記録ユーザーID |
| `baby_id` | Integer | 対象赤ちゃんID |
| `feeding_time` | DateTime | 授乳日時 |
| `feeding_type` | Enum | `BREAST` | `BOTTLE` | `MIXED` |
| `amount_ml` | Float | ミルク量 (ミルクの場合) |
| `duration_minutes` | Integer | 授乳時間（分）※左右合計または単独入力値 |
| `left_breast_minutes` | Integer | 左乳の授乳時間（分） |
| `right_breast_minutes` | Integer | 右乳の授乳時間（分） |
| `last_breast_side` | Enum | 最後に授乳した側 (`BreastSide`) |
| `bottle_content_type` | Enum | ボトルの中身種別 (`BottleContentType`) |
| `feeding_completion` | Enum | 授乳完全度 (`FeedingCompletion`) |
| `notes` | String | メモ (最大2000文字) |

## API仕様

### エンドポイント

- `GET /api/feedings/?baby_id={id}`: 授乳記録一覧取得
- `POST /api/feedings/`: 新規作成
    - **通知**: 記録作成成功時、対象の赤ちゃんの家族メンバー全員に通知（Push/In-App）が送信される。
- `PATCH /api/feedings/{id}`: 更新
- `DELETE /api/feedings/{id}`: 削除

### リクエストスキーマ (`FeedingCreate`, `FeedingUpdate`)

`app/schemas/feeding.py` 参照。

```typescript
{
  baby_id: number,
  feeding_time: string,                // ISO 8601
  feeding_type: "BREAST" | "BOTTLE" | "MIXED",
  amount_ml?: number,                  // ボトル授乳時の量
  duration_minutes?: number,           // 省略可（左右指定時は自動計算）
  left_breast_minutes?: number,        // 左乳の授乳時間
  right_breast_minutes?: number,       // 右乳の授乳時間
  last_breast_side?: "LEFT" | "RIGHT" | "BOTH",
  bottle_content_type?: "FORMULA" | "EXPRESSED_MILK" | "MIXED",
  feeding_completion?: "FULL" | "PARTIAL",
  notes?: string // 最大2000文字
}
```

※ `left_breast_minutes` と `right_breast_minutes` が両方指定された場合、バックエンドで `duration_minutes` が自動計算される。

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
  recorded_by_display_name: string | null
  comment_count: number
}
```

## UI コンポーネント構成

- `FeedingPage` (`app/(dashboard)/feeding/page.tsx`): ページラッパー
- `FeedingWidget` (`frontend/components/dashboard/FeedingWidget.tsx`): ダッシュボード用ウィジェット
- `FeedingForm` (`frontend/components/feeding/feeding-form.tsx`): 入力フォーム（作成・編集兼用）
    - 左右独立タイマー制御ロジックを内包
    - タブ切り替え（母乳/ミルク）
- `FeedingStats` (`frontend/components/feeding/feeding-stats.tsx`): 日次サマリー
- `FeedingHistory` (`frontend/components/feeding/feeding-history.tsx`): 履歴リスト
