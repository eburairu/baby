# 成長記録仕様書 (Growth Tracker Specification)

## 概要

赤ちゃんの成長（身長、体重、頭囲）を記録し、その推移をグラフやリストで確認できる機能。
定期的な検診や日々の成長を記録することで、発育状況を可視化する。

## ユーザーストーリー

- 親として、定期健診などで計測した身長や体重を日付とともに記録したい。
- 成長の過程をグラフで見て、順調に育っているかを確認したい。
- 過去の記録を振り返ったり、間違えた記録を修正・削除したい。
- 複数の項目（身長、体重、頭囲）をまとめて、あるいは個別に記録したい。

## 機能要件

### F1: 成長記録入力

- **入力項目**:
    - **計測日**: デフォルトは現在日付 (Datepicker等で選択可)。
    - **身長 (Height)**: cm単位 (小数点第1位まで)。必須ではない。
    - **体重 (Weight)**: g または kg単位。画面上は入力しやすい単位を選択可能にするが、DB保存は統一（例: g）。必須ではない。
    - **頭囲 (Head Circumference)**: cm単位 (小数点第1位まで)。必須ではない。
    - **メモ**: 自由記述。
- **入力ルール**:
    - 少なくとも1つの計測値（身長、体重、頭囲のいずれか）が入力されていること。
- **保存**: API に POST/PATCH して保存する。
    - **処理中フィードバック（新規・HIGH）**: 保存ボタンが押された後、API レスポンスが返るまでの間、ボタンを無効化（Disabled）し、「保存中...」およびスピナーを表示して処理中であることを示す。二重送信を完全に防止する。
    - **通知**: 記録が正常に保存された場合、家族全員（記録者本人以外）に対してプッシュ通知（"成長の記録: {ユーザー名}さんが{赤ちゃん名}の身長・体重を記録しました。"）を送信する。

### F2: 成長記録一覧 (History)

- 過去の記録を時系列（新しい順）でリスト表示。
- 各行に計測日、身長、体重、頭囲、**記録者名**（`recorded_by_display_name`）、メモを表示。`null`（削除済みユーザー）の場合は「不明」または表示省略。
- 編集ボタン、削除ボタンを配置。

### F3: 成長曲線グラフ (Growth Chart)

- 身長・体重・頭囲の推移を折れ線グラフで表示。
- **軸の設定**:
    - **X軸**: 日付 (Date)。赤ちゃんの誕生日からの経過日数ではなく、カレンダー通りの日付を表示する（WHO基準線表示との整合性のため）。
    - **Y軸**: 値 (cm / g)。表示されているデータ（ユーザーの記録およびWHO基準線）が適切に収まるよう、`domain={['auto', 'auto']}` による自動スケーリングを行う。
- **ズーム機能**:
    - **期間選択スライダー (Brush)**: グラフ下部に `Recharts` の `Brush` コンポーネントを配置。
        - 配色: `ui_design_system.md` に従い、`emerald` 系（`stroke="#10b981"` 等）を使用する。
    - **デフォルト表示範囲**: 記録が多数ある場合、初期状態では「直近6ヶ月」を表示する。
    - **クイック期間選択ボタン**: グラフ上部に、以下の期間を即座に選択できるボタンを配置する。
        - 7日 / 1ヶ月 / 6ヶ月 / 1年 / 全期間
    - **状態の維持**: 「身長」「体重」「頭囲」のタブを切り替えても、現在選択されている表示期間（ズーム範囲）が維持されるようにする。
- **WHO基準線の表示 (実装済み)**:
    - 赤ちゃんの性別と誕生日が登録されている場合、WHOの成長曲線（P3, P50, P97）を背景参照線として表示する。
    - グラフ上部にチェックボックスを配置し、表示/非表示を切り替え可能とする。デフォルトは表示 (Checked)。

## 画面構成

### 成長記録ページ (`/growth`)

ダッシュボード内のサブページ。

```
┌─────────────────────────────────┐
[ 成長記録 (Growth Tracker) ]

[ + 新しい記録を追加 (Modal or Form) ]

[ グラフエリア (Tabs: 身長 / 体重 / 頭囲) ]
┌─────────────────────────────────┐
│                                 │
│      📈 (Line Chart)            │
│                                 │
└─────────────────────────────────┘

[ 履歴リスト ]
┌──────────────────────────────────────────────────────────┐
│ 日付       │ 身長    │ 体重    │ 頭囲    │ 記録者 │ 操作 │
├──────────────────────────────────────────────────────────┤
│ 2026/02/10 │ 50.5 cm │ 3200 g  │ 34.0 cm │ ママ   │ ✎ 🗑️│
│ 2026/01/15 │ 48.0 cm │ 2900 g  │ 33.5 cm │ パパ   │ ✎ 🗑️│
└──────────────────────────────────────────────────────────┘
```

## データモデル

### モデル (`GrowthRecord`)

- `id`: Integer (PK)
- `baby_id`: Integer (FK -> babies.id)
- `user_id`: Integer (FK -> users.id) - 記録者
- `date`: Date (計測日)
- `height`: Float (cm, Nullable)
- `weight`: Integer (g, Nullable) ※g単位で保存
- `head_circumference`: Float (cm, Nullable)
- `notes`: String (Nullable)

## API

- `GET /api/growths/?baby_id={id}`
    - 指定した赤ちゃんの全記録を日付順（降順のみ）で取得。
- `POST /api/growths/`
    - 新規作成。
- `PATCH /api/growths/{id}`
    - 編集更新。
- `DELETE /api/growths/{id}`
    - 削除。

### リクエスト/レスポンススキーマ

```typescript
// POST リクエスト
interface GrowthCreate {
  baby_id: number
  date: string // YYYY-MM-DD形式
  height?: number
  weight?: number
  head_circumference?: number
  notes?: string
}

// PATCH リクエスト
interface GrowthUpdate {
  date?: string
  height?: number
  weight?: number
  head_circumference?: number
  notes?: string
}

// レスポンス
interface GrowthResponse extends GrowthCreate {
  id: number
  user_id: number
  recorded_by_display_name: string | null  // 記録者の表示名（ユーザーが削除された場合はnull）
  comment_count: number
}
```

## 技術設計

### フロントエンド

- **ライブラリ**: `Recharts` (グラフ描画)
- **コンポーネント**:
    - `GrowthPage`: メインページ
    - `GrowthChart`: グラフ表示コンポーネント (Tabsで切り替え)
    - `GrowthRecordForm`: 入力モーダル/フォーム (React Hook Form + Zod)
    - `GrowthHistoryList`: テーブルまたはリスト表示
- **状態管理**:
    - SWR (`useSWR`) でデータ取得・キャッシュ管理。

### バリデーション (Zod Schema)

`frontend/schemas/growth.ts` で定義。

```typescript
export const growthSchema = z.object({
    date: z.string().min(1, "日付を選択してください"),
    height: z.string().optional(),
    weight: z.string().optional(),
    head_circumference: z.string().optional(),
    notes: z.string().optional(),
}).refine(data => data.height || data.weight || data.head_circumference, {
    message: "身長、体重、頭囲の少なくとも1つを入力してください",
    path: ["height"],
})
```

※ 入力フォーム (`GrowthRecordForm`) 上ではHTML5の `type="number"` 属性により数値入力が強制され、送信時に `parseFloat/parseInt` による数値変換が行われる。
