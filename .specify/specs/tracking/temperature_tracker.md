# 体温記録仕様書 (Temperature Tracker Specification)

## 概要

赤ちゃんの体温を記録し、推移をグラフ・リストで確認できる機能。
発熱時の経過観察や通院判断の参考として活用する。

## ユーザーストーリー

- 親として、体温を測るたびに素早く記録をつけたい。
- 発熱しているかどうかを一目で確認したい（38℃以上を発熱の目安とする）。
- 体温の推移をグラフで見て、熱が上がっているか下がっているかを把握したい。
- 測定部位（わきの下・耳・額など）を記録として残したい。

## 機能要件

### F1: 体温記録入力

- **入力項目**:
    - **測定日時**: デフォルトは現在日時（日付と時刻の両方を指定可能）。
    - **体温 (Temperature)**: °C単位、小数点第1位まで（例: 37.5）。必須。
    - **測定部位 (Method)**: 以下の選択肢から1つ選択。デフォルトは「わきの下」。
        - わきの下 (AXILLARY)
        - 耳 (EAR)
        - 額 (FOREHEAD)
        - 直腸 (RECTAL)
    - **メモ**: 自由記述（任意）。
- **入力ルール**:
    - 体温は必須入力。
    - 体温の有効範囲: 34.0〜42.0°C。範囲外はバリデーションエラー。
- **保存**: API に POST/PUT して保存する。
    - **処理中フィードバック**: 保存ボタンが押された後、API レスポンスが返るまでの間、ボタンを無効化し「保存中...」とスピナーを表示する。二重送信を完全に防止する。
    - **家族への通知**: 記録作成成功時、対象の赤ちゃんの家族メンバー全員に通知（Push/In-App）が送信される。
        - タイトル: "体温の記録"
        - 本文: "{記録者名}さんが{赤ちゃん名}の体温を記録しました（{体温}°C）。"

### F2: 統計サマリー

- **今日の最高体温**: 当日の記録の中で最も高い体温を表示。
- **直近の体温**: 最新の1件の体温を大きく表示。
- **発熱フラグ**: 37.5°C以上の場合、体温の隣に「発熱」バッジ（赤系）を表示。38.0°C以上の場合は「高熱」バッジを表示。
- **前回測定からの経過時間**: 最後の記録からの経過時間を表示（例: 「3時間前」）。

### F3: 体温グラフ

- 過去の体温推移を折れ線グラフで表示（Recharts を使用）。
- **軸の設定**:
    - X軸: 日時（カレンダー通りの日時を表示）。
    - Y軸: 体温（°C）。`domain={[35, 'auto']}` で下限を35°Cとし、上限は自動スケーリング。
- **基準線**: 37.5°C に「発熱」の参照横線 (ReferenceLine) を点線で表示。
- **期間選択**: グラフ上部にクイック期間選択ボタンを配置する。
    - 24時間 / 3日 / 7日 / 1ヶ月 / 全期間
- **デフォルト表示範囲**: 直近7日間。
- **データポイントのカラー**: 37.5°C以上のポイントは赤色、それ以外は通常色（emerald系）で表示する。

### F4: 体温記録一覧 (History)

- 過去の記録を時系列（新しい順）でリスト表示。
- 各行に以下を表示:
    - 測定日時
    - 体温（発熱・高熱バッジ付き）
    - 測定部位ラベル
    - 記録者名 (`recorded_by_display_name`。削除済みユーザーは「不明」）
    - メモ（あれば）
- 編集・削除ボタンを配置。削除時は確認ダイアログを表示する。

## 画面構成

### 体温記録ページ (`/temperature`)

ダッシュボード内のサブページ。

```
┌─────────────────────────────────┐
│  [統計サマリー カード]            │
│  直近: 37.2°C  今日の最高: 38.0°C│
│  前回測定: 2時間前               │
├─────────────────────────────────┤
│  [体温グラフ]                    │
│  [ 24h | 3日 | 7日 | 1ヶ月 | 全 ]│
│  ┌─────────────────────────────┐ │
│  │         📈 折れ線グラフ      │ │
│  │ ----37.5°C基準線--------    │ │
│  └─────────────────────────────┘ │
├─────────────────────────────────┤
│  [入力フォーム]                  │
│  体温: [ 37.2 ] °C              │
│  部位: [ わきの下 ▼ ]           │
│  日時: [ 2026/03/09 14:30 ]     │
│  メモ: [ ...]                   │
│        [ 記録する ]              │
├─────────────────────────────────┤
│  最近の記録                      │
│  ─────────────────────          │
│  🌡 38.0°C [高熱] わきの下      │
│     2026/03/09 14:30  👤 ママ   │
│                                 │
│  🌡 37.5°C [発熱] 耳            │
│     2026/03/09 11:00  👤 パパ   │
│                                 │
│  🌡 36.8°C  わきの下            │
│     2026/03/08 20:00  👤 ママ   │
└─────────────────────────────────┘
```

## データモデル

### モデル (`TemperatureRecord`)

- `id`: Integer (PK)
- `baby_id`: Integer (FK -> babies.id)
- `user_id`: Integer (FK -> users.id) — 記録者
- `measured_at`: DateTime (測定日時。タイムゾーン付き UTC 保存)
- `temperature`: Float (°C 単位、小数点第1位まで)
- `method`: Enum ('AXILLARY' | 'EAR' | 'FOREHEAD' | 'RECTAL') — 測定部位。デフォルト 'AXILLARY'
- `notes`: String (Nullable)

## API

- `GET /api/temperatures/?baby_id={id}&skip={skip}&limit={limit}`
    - 指定した赤ちゃんの記録を測定日時順（降順）で取得。
    - デフォルト: skip=0, limit=100
- `POST /api/temperatures/`
    - 新規作成。
- `PUT /api/temperatures/{id}`
    - 編集更新（全フィールド送信による更新）。
- `DELETE /api/temperatures/{id}`
    - 削除。

### リクエスト/レスポンススキーマ

```typescript
enum TemperatureMethod {
  AXILLARY = "AXILLARY",   // わきの下
  EAR = "EAR",             // 耳
  FOREHEAD = "FOREHEAD",   // 額
  RECTAL = "RECTAL"        // 直腸
}

// POST リクエスト
interface TemperatureCreate {
  baby_id: number
  measured_at: string  // ISO 8601
  temperature: number  // °C
  method?: TemperatureMethod  // デフォルト: AXILLARY
  notes?: string
}

// PUT リクエスト
interface TemperatureUpdate {
  measured_at?: string
  temperature?: number
  method?: TemperatureMethod
  notes?: string
}

// レスポンス
interface TemperatureResponse extends TemperatureCreate {
  id: number
  user_id: number
  recorded_by_display_name: string | null
  comment_count: number
}
```

## 技術設計

### バックエンド

- **モデル**: `app/models/temperature.py` — `TemperatureRecord` テーブル定義。
- **スキーマ**: `app/schemas/temperature.py` — `TemperatureCreate` / `TemperatureUpdate` / `TemperatureResponse`。
- **ルーター**: `app/routers/temperatures.py` — CRUD エンドポイント。`verify_baby_access` で権限チェック。
- **Enum**: `TemperatureMethod` を `app/models/temperature.py` で定義。

### フロントエンド

- **ライブラリ**: `Recharts`（グラフ描画）
- **コンポーネント**:
    - `TemperaturePage`: メインページ (`app/(dashboard)/temperature/page.tsx`)
    - `TemperatureChart`: グラフ表示コンポーネント（期間切り替え付き）
    - `TemperatureForm`: 入力フォーム（React Hook Form + Zod）
    - `TemperatureHistory`: 履歴リスト（編集・削除・コメント対応）
    - `TemperatureStats`: サマリーカード（直近体温・最高体温・発熱バッジ）
- **状態管理**: SWR (`useSWR`) でデータ取得・キャッシュ管理。
- **テーマカラー**: `orange`（例: `text-orange-500`）をアイコン・アクセントカラーとして使用。

### バリデーション (Zod Schema)

`frontend/schemas/temperature.ts` で定義。

```typescript
export const temperatureSchema = z.object({
    measured_at: z.string().min(1, "日時を選択してください"),
    temperature: z
        .string()
        .min(1, "体温を入力してください")
        .refine(
            val => {
                const num = parseFloat(val)
                return !isNaN(num) && num >= 34.0 && num <= 42.0
            },
            { message: "体温は34.0〜42.0°Cの範囲で入力してください" }
        ),
    method: z.enum(["AXILLARY", "EAR", "FOREHEAD", "RECTAL"]).default("AXILLARY"),
    notes: z.string().optional(),
})
```

### 発熱判定ロジック（フロントエンド）

```typescript
export const getFeverStatus = (temp: number): "high_fever" | "fever" | "normal" => {
    if (temp >= 38.0) return "high_fever"
    if (temp >= 37.5) return "fever"
    return "normal"
}
```

## アクセス制御

- 記録の作成・編集・削除は `canWrite` 権限（Admin または Member）を持つユーザーのみ可能。
- 記録の閲覧は対象の赤ちゃんへのアクセス権があれば可能。
- 他のユーザーが作成した記録の編集・削除は Admin のみ可能（バックエンド側で `verify_baby_access` により制御）。
