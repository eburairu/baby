# AI育児日誌生成 詳細仕様書 (AI Daily Summary Detailed Specification)

## 概要

このドキュメントは、育児日誌（`daily_summaries`）の AI 生成プロセス、プロンプト、および赤ちゃんの特徴更新ロジックの詳細を定義する。
UI や基本的な CRUD 仕様については `.specify/specs/tracking/daily_diary.md` を参照。

---

## データモデル

### `DailySummary`

AI 生成結果およびユーザー編集内容を保持するモデル。

| カラム名 | 型 | 説明 |
|---------|----|------|
| `id` | Integer | PK |
| `baby_id` | Integer | FK (Babies) |
| `user_id` | Integer (Nullable) | 生成または最終更新を行ったユーザーの ID |
| `summary_date` | Date | 日誌の対象日 (JST) |
| `generated_content` | Text | AI が生成したオリジナルの日誌テキスト（不変） |
| `edited_content` | Text (Nullable) | ユーザーが手動編集したテキスト。未編集時は Null |
| `is_edited` | Boolean | ユーザーによる編集が行われたか（`edited_content` が存在するか） |
| `model_name` | String (Nullable) | 生成に使用したモデル名（例: `gemini-1.5-pro`） |
| `image_urls` | JSON (Array) | 添付された画像の URL リスト |
| `created_at` | DateTime | 作成日時 |
| `updated_at` | DateTime | 更新日時 |

- **ユニーク制約**: `baby_id` + `summary_date`

---

## 日誌生成プロセス

### 1. データの集計 (`build_daily_prompt`)

指定した日付の全育児記録を以下の優先順位で抽出し、AI への入力テキストを生成する。
- **対象データ**: 授乳 (Feeding), 睡眠 (Sleep), おむつ (Diaper), メモ (Note), 成長記録 (Growth)。
- **時間範囲**: JST 基準の 0:00 〜 23:59。

### 2. プロンプト構築

AI に渡すプロンプトは以下の構成とする。
- **システム設定**: 育児日誌を書くアシスタントとしての役割。
- **コンテキスト**: 現在の赤ちゃんの特徴（`characteristics`）。
- **当日の記録**: 各カテゴリーごとの詳細な記録テキスト。
- **出力形式**: 温かみのある 100〜200 字程度の自然な文章。

### 3. 生成ロジック (`generate_daily_summary`)

- モデル名、パラメーター（Temperature 等）は管理設定に従う。
- 記録が 0 件の場合は `400 Bad Request`（または `ValueError`）。
- **安全性フィルター**: 生成結果が安全性フィルター（SAFETY, PROHIBITED_CONTENT 等）によりブロックされた場合、エラーにはせず、以下の定型文を返却する。
  > "本日の記録を読み込みましたが、内容に健康上の懸念が含まれている可能性があるため、自動生成を控えました。赤ちゃんの状態を直接確認し、必要に応じて専門家にご相談ください。"
- AI API 障害時（RateLimit 等）は `503 Service Unavailable`。

---

## 赤ちゃんの特徴更新ロジック (`update_baby_characteristics`)

日誌生成後に、以下のロジックで赤ちゃんの特徴（`characteristics`）を自動更新する。

### 1. 更新用プロンプト

AI に対し、以下の情報を元に特徴の抽出を依頼する。
- **インプット**: 現在の特徴、本日の記録、生成された日記。
- **抽出条件**: 
    - 中長期的な変化（例：「最近夜泣きが増えてきた」「右側を向く癖がある」）を抽出。
    - 一時的な出来事は含めない。
    - 解消された特徴は削除または「解消された」と更新。

### 2. 保存

抽出された特徴テキストを `babies` テーブルの `characteristics` カラムに保存する。
この処理は **日誌生成リクエスト内で同期的** に実行される（API レスポンス返却前に行われる）。
特徴更新処理自体が失敗しても、日誌生成は成功とみなす（ログ出力のみ）。

---

## AI モデル設定（管理画面）

管理者が以下のパラメーターを動的に変更可能。

| 設定キー | 説明 | デフォルト |
|--------|------|------|
| `llm_model` | 使用するモデル名 | `gemini-1.5-pro` |
| `ai_enabled_summary` | 日誌生成機能の有効化 | `true` |
| `llm_temperature` | 生成時の多様性 | `0.7` |
| `llm_max_tokens` | 最大出力トークン数 | `600` |
| `llm_reasoning_effort` | 推論の深さ (Reasoning Effort) | `default` (サポートモデルのみ有効) |

---

## API エンドポイント詳細

### `POST /api/babies/{baby_id}/daily-summary`

**概要**: 指定日の育児日誌を AI 生成（または取得・更新）。

**挙動**:
1. **未来日付チェック**: 指定日が JST 基準で未来の場合は `400 Bad Request`。
2. **既存レコードの確認**:
   - **編集済み (`is_edited=true`) の場合**: 再生成を行わず、既存のレコードをそのまま返す（誤操作防止）。
   - **未編集 (`is_edited=false`) の場合**: AI 生成を実行し、既存の内容を上書き更新する。
3. **新規生成**: レコードが存在しない場合は新規作成する。
4. **通知**: 作成または更新完了時に、家族メンバー（`Family`）に対してアプリ内通知を送信する。

---

## 参照先ドキュメント

- `.specify/specs/tracking/daily_diary.md` — 育児日誌の基本仕様・UI
- `.specify/specs/settings/ai_settings_admin.md` — AI 管理設定画面
- `.specify/specs/tracking/general_memo.md` — 汎用メモとの連携
