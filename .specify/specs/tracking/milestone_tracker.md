# 発育発達マイルストーン 仕様書 (Growth & Milestone Tracker Specification)

## 概要

赤ちゃんの成長の節目（できたこと、発育・発達イベント）を日付と写真で記録し、振り返ることができる機能。
数値では表せない成長の過程を可視化する。

## ユーザーストーリー

- 親として、「初めて寝返りをした日」などの大切な瞬間を記録しておきたい。
- いつ頃、何ができるようになるのが一般的なのかを知るためのガイドラインがほしい。
- 家族全員で、「できたね！」という喜びを共有したい。
- 写真を添えて、成長の軌跡をきれいに振り返りたい。

## 機能要件

### F1: マイルストーン記録入力

- **入力項目**:
    - **マイルストーン名**: リストから選択（プリセット参照）または自由入力。
    - **達成日**: 達成した日 (Datepicker等で選択)。
    - **メモ**: 詳細な様子や感情など。
    - **写真**: 達成時の写真を最大10枚まで添付（S3/Cloudinary/R2等にアップロード）。
- **プリセット項目**:
    - `first_smile`: 初めての笑顔
    - `rolling_over`: 寝返り
    - `sitting_up`: お座り
    - `crawling`: はいはい
    - `standing_up`: つかまり立ち
    - `walking`: ひとり歩き
    - `first_word`: 初めてのおしゃべり
    - `first_solid_food`: 離乳食開始
    - `bye_bye`: バイバイ
- **保存**: API に POST/PATCH して保存する。
    - 保存成功後、家族全員にプッシュ通知（"できたね！: {赤ちゃん名}が「{マイルストーン名}」に成功しました！"）。

### F2: マイルストーン一覧 (Milestone Timeline)

- タイムライン形式で表示。
- 月齢（生後○ヶ月）ごとに区切って、達成された項目を時系列に並べる。
- 達成済みの項目はチェックマークやアイコンで表示。
- 未達成の項目も「今後の目安」として表示可能（WHOや厚生労働省のガイドラインに基づく時期の目安を表示）。

### F3: 編集・削除

- 過去に記録したマイルストーンの情報を修正・削除可能。

## データモデル

### モデル (`Milestone`)

- `id`: Integer (PK)
- `baby_id`: Integer (FK -> babies.id)
- `user_id`: Integer (FK -> users.id) - 記録者
- `milestone_type`: String (例: "rolling_over") または "custom"
- `title`: String (表示名、例: "寝返り")
- `achieved_date`: Date (達成日)
- `image_urls`: JSON (写真のURLリスト、Default: [])
- `notes`: String (Nullable)

## API

- `GET /api/milestones/?baby_id={id}`
    - 指定した赤ちゃんの全マイルストーンを降順で取得。
- `GET /api/milestones/timeline?baby_id={id}`
    - 指定した赤ちゃんの全マイルストーンを月齢（生後○ヶ月）ごとにグループ化して取得。
- `POST /api/milestones/?baby_id={id}`
    - 新規作成。リクエストボディに `baby_id` を含めず、クエリパラメータから取得する。
- `PATCH /api/milestones/{id}`
    - 編集更新。
- `DELETE /api/milestones/{id}`
    - 削除。

### リクエスト/レスポンススキーマ

```typescript
// 共通ベース
interface MilestoneBase {
  milestone_type: string
  title: string
  achieved_date: string // YYYY-MM-DD形式
  image_urls: string[]
  notes?: string
}

// POST リクエスト (クエリパラメータ: ?baby_id={id})
interface MilestoneCreate extends MilestoneBase {}

// PATCH リクエスト
interface MilestoneUpdate {
  milestone_type?: string
  title?: string
  achieved_date?: string
  image_urls?: string[]
  notes?: string
}

// レスポンス
interface MilestoneResponse extends MilestoneBase {
  id: number
  baby_id: number
  user_id: number | null
}

// タイムラインレスポンス
interface MilestoneTimelineGroup {
  month_age: number
  milestones: MilestoneResponse[]
}
```

## 技術設計

### フロントエンド

- **ライブラリ**: `shadcn/ui` (Card, Dialog, Calendar), `lucide-react` (アイコン)
- **コンポーネント**:
    - `MilestoneTimeline`: 垂直タイムライン形式の一覧表示。
    - `MilestoneCard`: 各項目のカード表示（写真、タイトル、日付）。
    - `MilestoneForm`: 入力フォーム（写真アップロード機能含む）。
- **写真アップロード**:
    - `/api/upload/` を経由して画像を保存し、そのURLを `image_url` に格納。

### バリデーション (Zod Schema)

`frontend/schemas/milestone.ts` で定義。

```typescript
export const milestoneSchema = z.object({
    achieved_date: z.string().min(1, "日付を選択してください"),
    title: z.string().min(1, "項目名を入力または選択してください"),
    notes: z.string().optional(),
    image_url: z.string().optional(),
})
```
