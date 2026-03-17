# AI 設定仕様書 (AI Settings Specification)

## 概要

管理者が AI 機能（チャット、日誌生成、フィードバック）の動作をカスタマイズできる設定画面。
使用する LLM モデルの選択、生成パラメーターの調整、および機能の有効化/無効化を管理する。

## 1. ユーザーストーリー

- **モデルを最新化したい**
    - 管理者は、LLM プロバイダー（Gemini 等）が提供する最新のモデルを管理画面から選択し、即座にアプリ全体に反映させたい。
    - **Acceptance Criteria**: API を通じて最新のモデルリストを取得し、プルダウンで選択できること。

- **コストと品質のバランスを調整したい**
    - 管理者は、重要度の低い機能には軽量・安価なモデルを、重要な機能には高品質なモデルを割り当てたり、全体的な応答の長さを制限したりしたい。
    - **Acceptance Criteria**: モデルごとに Temperature や Max Tokens を調整できること。

- **不具合時に一時停止したい**
    - 管理者は、AI 機能に不具合が発生した場合や予算上限に達した場合に、特定の AI 機能を一時的に無効化したい。
    - **Acceptance Criteria**: 各 AI 機能（チャット・日誌・フィードバック）の ON/OFF トグルがあること。

## 2. データベース設計

設定値は家族（Family）単位、またはシステム全体（Global）として保存する。
Botoro の現在の設計思想に基づき、**システム全体のデフォルト設定**として実装し、将来的には家族ごとのオーバーライドを可能にする拡張性を残す。

### 新規テーブル: `system_settings`

| カラム名 | 型 | 説明 |
|---------|---|------|
| `id` | `Integer` | PK |
| `key` | `String(50)` | 設定キー (例: `llm_model`, `ai_enabled_chat`) |
| `value` | `Text` | 設定値 (JSON 形式または文字列) |
| `updated_at` | `DateTime` | 最終更新日時 |

**初期シードデータ**:
- `llm_model`: `"gemini-1.5-pro"`
- `ai_enabled_chat`: `"true"`
- `ai_enabled_summary`: `"true"`
- `ai_enabled_feedback`: `"true"`
- `llm_temperature`: `"0.7"`
- `llm_max_tokens`: `"800"`

## 3. バックエンド設計

### 3.1 API エンドポイント

#### `GET /api/ai/available-models`

- **概要**: 使用可能な LLM モデルのリストを取得する。
- **実装内容**: `LLM_PROVIDER` に基づき、各プロバイダーの API (例: Google AI Studio の `list_models`) を呼び出して、有効なモデル名と説明のリストを返す。
- **キャッシュ**: 1時間程度キャッシュすることを推奨。

#### `GET /api/ai/settings`

- **概要**: 現在の AI 設定値を取得する。
- **権限**: 全ユーザー（参照のみ）、または admin のみ（画面要件に依存）。基本は **admin のみ**とする。

#### `PATCH /api/ai/settings`

- **概要**: AI 設定値を更新する。
- **権限**: `admin` ロールのみ。
- **バリデーション**: `llm_temperature` は 0.0〜2.0 の範囲内であること等。
### 3.2 リクエスト/レスポンススキーマ

```typescript
interface AIModel {
  id: string;
  name: string;
  description: string;
}

interface AISettings {
  llm_model: string;
  llm_temperature: number;
  llm_max_tokens: number;
  ai_enabled_chat: boolean;
  ai_enabled_summary: boolean;
  ai_enabled_feedback: boolean;
}

interface AISettingsSummary {
  settings: AISettings;
  available_models: AIModel[];
}

interface AISettingsPatch {
  settings: Record<string, string>; // key -> value (文字列ベース) の辞書
}
```



### 3.3 サービスロジックの変更

既存の AI サービス（`ai_summary.py`, `chatbot.py`, `ai_feedback.py`）は、環境変数 `LLM_MODEL` の代わりに、DB から取得した設定値を使用するように変更する。

```python
# 疑似コードイメージ
def get_llm_config(db: Session):
    model = get_setting(db, "llm_model") or os.environ.get("LLM_MODEL")
    # ... 他の設定値も同様に取得
```

## 4. フロントエンド設計

### 4.1 管理画面 (`/settings/ai`)

設定ナビゲーションから「AI 設定」としてアクセス可能にする。

**構成要素**:

1.  **モデル選択 (Model Selection)**
    - プルダウンメニュー。API から取得したモデルリストを表示。
    - 選択中のモデルにチェックマークまたは強調表示。

2.  **生成パラメーター (Parameters)**
    - **Temperature**: スライダー (0.0 〜 1.0)。
    - **Max Tokens**: 数値入力 (200 〜 4000)。

3.  **機能トグル (Feature Toggles)**
    - **育児相談チャット**: Switch コンポーネント。
    - **AI 日誌生成**: Switch コンポーネント。
    - **記録フィードバック**: Switch コンポーネント。

4.  **保存ボタン**
    - 変更があった場合のみ活性化。

### 4.2 コンポーネント

- `Select` (shadcn/ui): モデル選択用。
- `Slider` (shadcn/ui): Temperature 調整用。
- `Switch` (shadcn/ui): 機能トグル用。

## 5. 権限制御

- 設定の閲覧・変更は、現在ログインしているユーザーの `FamilyUser.role` が `admin` である場合にのみ許可する。
- 非 admin ユーザーが `/settings/ai` に直接アクセスしようとした場合は、403 エラーを表示し設定トップにリダイレクトする。

## 6. 実装チェックリスト

### バックエンド
- [ ] `system_settings` テーブルの作成 (Alembic)
- [ ] `GET /api/ai/available-models` 実装 (Google AI SDK 連携)
- [ ] `GET /api/ai/settings` 実装
- [ ] `PATCH /api/ai/settings` 実装 (admin 権限チェック)
- [ ] 既存 AI サービスの設定値取得ロジックの置換

### フロントエンド
- [ ] `useAISettings.ts` フック作成
- [ ] `/settings/ai` ページの作成
- [ ] `settings_navigation.md` への項目追加
- [ ] admin 以外へのアクセスガード実装
