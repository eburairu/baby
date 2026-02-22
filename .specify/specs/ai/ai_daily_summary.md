# AI育児日誌生成 詳細仕様書 (AI Daily Summary Detailed Specification)

## 概要

このドキュメントは、育児日誌（`daily_summaries`）の AI 生成プロセス、プロンプト、および赤ちゃんの特徴更新ロジックの詳細を定義する。
UI や基本的な CRUD 仕様については `.specify/specs/tracking/daily_diary.md` を参照。

---

## 日誌生成プロセス

### 1. データの集計 (`build_daily_prompt`)

指定した日付の全育児記録を以下の優先順位で抽出し、AI への入力テキストを生成する。
- **対象データ**: 授乳 (Feeding), 睡眠 (Sleep), おむつ (Diaper), 成長 (Growth), メモ (Note)。
- **時間範囲**: JST 基準の 0:00 〜 23:59。

### 2. プロンプト構築

AI に渡すプロンプトは以下の構成とする。
- **システム設定**: 育児日誌を書くアシスタントとしての役割。
- **コンテキスト**: 現在の赤ちゃんの特徴（`characteristics`）。
- **当日の記録**: 各カテゴリーごとの詳細な記録テキスト。
- **出力形式**: 温かみのある 100〜200 字程度の自然な文章。

### 3. 生成ロジック (`generate_daily_summary`)

- モデル名、パラメーター（Temperature 等）は管理設定に従う。
- 記録が 0 件の場合は `400 Bad Request`。
- AI API 障害時は `503 Service Unavailable`。

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
この処理は日誌生成の成功後にバックグラウンド（または同期）で実行される。

---

## AI モデル設定（管理画面）

管理者が以下のパラメーターを動的に変更可能。

| 設定キー | 説明 | デフォルト |
|--------|------|------|
| `llm_model` | 使用するモデル名 | `gemini-1.5-pro` |
| `ai_enabled_summary` | 日誌生成機能の有効化 | `true` |
| `llm_temperature` | 生成時の多様性 | `0.7` |
| `llm_max_tokens` | 最大出力トークン数 | `600` |

---

## API エンドポイント詳細

### `POST /api/babies/{baby_id}/daily-summary`

**概要**: 指定日の育児日誌を AI 生成（upsert）。
- **再生成の扱い**: すでに `is_edited=true` のレコードが存在する場合、誤操作防止のため原則として再生成を拒否するか、明示的なフラグが必要。

---

## 参照先ドキュメント

- `.specify/specs/tracking/daily_diary.md` — 育児日誌の基本仕様・UI
- `.specify/specs/settings/ai_settings_admin.md` — AI 管理設定画面
- `.specify/specs/tracking/general_memo.md` — 汎用メモとの連携
