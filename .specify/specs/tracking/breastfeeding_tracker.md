# 授乳記録機能仕様書 (Breastfeeding Tracker Specification)

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
- 忙しい時にダッシュボードから1タップで記録を開始したい。

## 機能要件

### F1: 授乳記録入力

- **種類選択**:
    - 🤱 母乳 (BREAST)
    - 🍼 ミルク (BOTTLE) - 粉ミルク・搾母乳を区別して記録可能
    - ※ `MIXED` (混合) タイプはデータモデル上に存在するが、現在のUIでは「ミルク (BOTTLE)」タブ内の「混合 (MIXED)」コンテンツタイプとして扱われるため、`FeedingType.MIXED` としては記録されない。
- **入力項目**:
    - **母乳の場合**:
        - **左右別タイマー**: 左乳・右乳それぞれに独立したタイマーを持つ。片方を起動するともう一方は自動停止。**（※新規作成時のみ利用可能。編集時は非表示）**
        - **左右別手動入力**: `左: [ X ] 分 / 右: [ Y ] 分` で入力可能。**（※編集時も利用可能）**
        - **合計時間の自動計算**: フロントエンド (`feedingUtils.ts`) およびバックエンド (`FeedingCreate` validator) の両方で、`left_breast_minutes` + `right_breast_minutes` の合計を `duration_minutes` として自動計算する。
    - **ミルクの場合**:
        - 量 (ml): 10ml単位などで入力。
        - **増減ボタン**: 入力欄の横に 10ml 単位で調整できる `[-]` `[+]` ボタンを配置し、キーボード入力なしで素早く調整可能にする。
        - **デフォルト値の保持**: ミルク記録時、前回の記録がある場合はその「量 (amount_ml)」および「ボトルの中身種別 (bottle_content_type)」をデフォルト値として入力欄にセットする。
        - **ボトルコンテンツタイプ**: 「粉ミルク / 搾母乳 / 混合」をラジオボタンで選択。
    - **共通**:
        - 時刻: デフォルトは「現在時刻」。過去分の入力も可能。
        - **授乳完全度**: 「しっかり飲んだ / 途中でやめた」のトグル選択。
        - メモ: 自由記述。
- **保存**: API に POST して保存する。
    - **処理中フィードバック**: 保存ボタンが押された後、API レスポンスが返るまでの間、ボタンを無効化（Disabled）し、「保存中...」およびスピナーを表示して処理中であることを示す。
- **クイック記録**:
    - ダッシュボードの `QuickActionBar` のミルク（🍼）・母乳（🤱）ボタンをタップすると `FeedingQuickAddModal` が開く。
    - モーダルはタップしたボタンに対応するタブ（ミルク or 母乳）が選択済みの状態で開き、ユーザーが詳細を入力してから記録する。
    - 即時記録（ボタンタップで直接API呼び出し）は行わない。

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
- **コメント機能**:
    - 各記録に対してコメントを追加可能。
    - 一覧にはコメントアイコンとコメント数（件数 > 0 の場合）が表示される。
    - アイコンクリックでコメントダイアログを開き、家族間のコミュニケーションを行える。

### F3: 統計サマリー (Daily)

- **今日の合計**:
    - 授乳回数
    - 母乳合計時間 (分)
    - ミルク合計量 (ml)
    - **左右別今日の合計**: `今日の母乳内訳: 左 45分 / 右 45分`
- **前回からの経過時間**:
    - 最後の授乳記録からの経過時間を「2時間前」「たった今」などの相対時間で表示。
- **最終授乳情報の表示**:
    - 前回の記録から `last_breast_side` を取得し「前回: 右から授乳」を表示。
    - 前回のミルク記録から `amount_ml` および `bottle_content_type` を取得し、次回入力時のデフォルト値として利用する。
- **次回ガイドメッセージ**: 最後の授乳側に基づき以下のメッセージを表示。
    - 左終了時: 「次回は右から始めましょう」
    - 右終了時: 「次回は左から始めましょう」
    - 両方終了時: 「次回はどちらからでも大丈夫です」

## データモデル (Feeding)

`app/models/feeding.py` で定義。

### Enum 定義

```python
class FeedingType(str, Enum):
    BREAST = "BREAST"
    BOTTLE = "BOTTLE"
    MIXED = "MIXED"  # ※現在はUIから使用されていない（非推奨）

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
| `burped` | Boolean | ゲップの有無 (Nullable) |
| `notes` | String | メモ (最大2000文字) |

## API仕様

### エンドポイント

- `GET /api/feedings/?baby_id={id}`: 授乳記録一覧取得
- `POST /api/feedings/`: 新規作成
    - **通知**: 記録作成成功時、サーバー側 (`app/routers/feeding.py`) で `notify_family_members_bg` を呼び出し、対象の赤ちゃんの家族メンバー全員（記録者本人を除く）にプッシュ通知およびアプリ内通知を送信する。
- `PATCH /api/feedings/{id}`: 更新
    - 授乳タイプの変更（母乳⇔ミルク）時には、不要となるフィールド（例：ミルクへ変更時の母乳時間など）がサーバー側で自動的にクリアされる。
- `DELETE /api/feedings/{id}`: 削除

### リクエストスキーマ (`FeedingCreate`, `FeedingUpdate`)

`app/schemas/feeding.py` 参照。バリデーションルールは `app/core/constants.py` に準拠。

```typescript
// Create
interface FeedingCreate {
  baby_id: number
  feeding_time: string                // ISO 8601
  feeding_type: "BREAST" | "BOTTLE" | "MIXED" // ※MIXEDは現在UIから送信されない
  amount_ml?: number                  // 0 <= x <= 500 (MAX_FEEDING_ML)
  duration_minutes?: number           // 0 <= x <= 300 (MAX_FEEDING_DURATION_MINUTES)。左右指定時は自動計算
  left_breast_minutes?: number        // 0 <= x <= 120 (MAX_BREAST_FEEDING_MINUTES)
  right_breast_minutes?: number       // 0 <= x <= 120 (MAX_BREAST_FEEDING_MINUTES)
  last_breast_side?: "LEFT" | "RIGHT" | "BOTH"
  bottle_content_type?: "FORMULA" | "EXPRESSED_MILK" | "MIXED"
  feeding_completion?: "FULL" | "PARTIAL"
  burped?: boolean
  notes?: string                      // 最大2000文字 (NOTE_MAX_LENGTH)
}

// Update
interface FeedingUpdate {
  feeding_time?: string
  feeding_type?: "BREAST" | "BOTTLE" | "MIXED"
  amount_ml?: number
  duration_minutes?: number
  left_breast_minutes?: number
  right_breast_minutes?: number
  last_breast_side?: "LEFT" | "RIGHT" | "BOTH"
  bottle_content_type?: "FORMULA" | "EXPRESSED_MILK" | "MIXED"
  feeding_completion?: "FULL" | "PARTIAL"
  burped?: boolean
  notes?: string
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
  burped: boolean | null
  notes: string | null
  // 以下はRouterで付与される計算フィールド
  recorded_by_display_name: string | null // 記録者の表示名
  comment_count: number // コメント数（デフォルト: 0）
}
```

## UI コンポーネント構成

- `FeedingPage` (`app/(dashboard)/feeding/page.tsx`): ページラッパー
- `FeedingWidget` (`frontend/components/dashboard/FeedingWidget.tsx`): ダッシュボード用ウィジェット
- `FeedingQuickAddModal` (`frontend/components/feeding/FeedingQuickAddModal.tsx`): クイックアクションバーから呼び出される授乳記録モーダル。`FeedingForm` を内包し、初期タブ（ミルク or 母乳）を `feedingType` prop で受け取る。
- `FeedingForm` (`frontend/components/feeding/feeding-form.tsx`): 入力フォーム（作成・編集兼用）
    - `FeedingTimerSection`: 左右独立タイマーUI。**新規作成時のみ表示**され、編集モードでは非表示。
    - `BreastFeedingFields`: 母乳手動入力フィールド。
    - `BottleFeedingFields`: ミルク入力フィールド（種類選択含む）。
    - `FeedingCompletionSelector`: 授乳完全度選択。
- `FeedingEditDialog` (`frontend/components/feeding/FeedingEditDialog.tsx`): 編集ダイアログ
- `FeedingStats` (`frontend/components/feeding/feeding-stats.tsx`): 日次サマリー
- `FeedingHistory` (`frontend/components/feeding/feeding-history.tsx`): 履歴リスト
