# AI記録フィードバック機能 仕様書

## 1. 機能概要

### 目的

記録（授乳・おむつ・成長・メモ）を保存した直後に、直近24時間の記録データをAIが分析し、結果を既存のコメント機能を通じて自動投稿する。

- AIコメントはDBに保存され、後から見返せる
- 通常のユーザーコメントと同じUIで表示し、AIマーク（🤖）と専用スタイルで視覚的に区別
- 気になる点がある場合は警告スタイル（黄色・オレンジ系）で表示

### ユーザーストーリー

**正常値の場合（安心・情報提供）**
- 授乳を記録した直後、コメント欄に「🤖 今日は3時間おきに授乳できています。直近24時間で5回、安定したペースが続いています」とAIコメントが自動追加される
- おむつを記録した直後、「🤖 今日の排便は2回です。直近24時間でおしっこ8回、うんち2回と良好なペースです」と概況コメントが追加される
- 成長測定を記録した直後、「🤖 体重が前回より50g増えています。順調な増加ペースです」と確認できる

**異常値・気になる点がある場合（警告・アドバイス）**
- おむつに「うんちが少なかった」というメモが続いている状態で記録すると、**黄色の警告スタイル**で「🤖 直近24時間でうんちが1回と少ない傾向です。ミルクの量が不足している可能性があります。授乳量を確認してみてください」とコメントが追加される
- 前回の授乳から8時間以上経過した状態で記録すると、「🤖 前回の授乳から8時間が経過しています。新生児期は授乳間隔が空きすぎないよう注意が必要です」と警告コメントが表示される
- 成長記録で前回より体重が大きく減少している場合、「🤖 体重が前回より150g減少しています。授乳状況を確認し、気になる場合は小児科にご相談ください」と警告コメントが追加される

---

## 2. 対象記録タイプと分析ロジック

### 分析対象

| 記録タイプ | トリガー操作 | 分析時間範囲 |
|-----------|------------|------------|
| 授乳 (feeding) | POST /api/feedings/ 成功後 | 直近24時間の全種類の記録 |
| おむつ (diaper) | POST /api/diapers/ 成功後 | 直近24時間の全種類の記録 |
| 成長 (growth) | POST /api/growths/ 成功後 | 直近24時間の全種類の記録 + 前回成長記録 |
| メモ (note) | POST /api/notes/ 成功後 | 直近24時間の全種類の記録 |

### 分析の焦点（記録タイプ別）

| トリガー記録タイプ | AIが重点的に言及する観点 |
|-----------------|----------------------|
| 授乳 | 前回からの間隔、今日の回数・総量・総授乳時間 |
| おむつ | 今日の回数・内訳（おしっこ/うんち）、前回からの経過時間 |
| 成長 | 前回測定値との差分（体重増加量） |
| メモ | メモの内容を踏まえた全体的なコメント |

---

## 3. APIエンドポイント設計

### エンドポイント

```
POST /api/babies/{baby_id}/record-feedback
```

このエンドポイントはAI分析を実行し、結果を対象記録のコメントとして自動保存する。

### リクエスト

```json
{
  "record_type": "feeding",
  "record_id": 123
}
```

| フィールド | 型 | 説明 |
|-----------|---|------|
| `record_type` | `"feeding" \| "diaper" \| "growth" \| "note"` | 直前に保存した記録タイプ |
| `record_id` | `int` | 直前に保存した記録のID |

### レスポンス（201 Created）

```json
{
  "feedback": "今日は3時間おきに授乳できています。直近24時間で5回、合計120mlのミルクを飲んでいます。安定したペースが続いています。",
  "has_concern": false,
  "comment_id": 456,
  "record_type": "feeding",
  "analyzed_at": "2026-02-21T14:32:00+09:00",
  "model_name": "gemini-3-pro"
}
```

| フィールド | 型 | 説明 |
|-----------|---|------|
| `feedback` | `str` | AIが生成したフィードバックテキスト（50〜150字程度） |
| `has_concern` | `bool` | AIが気になる点を検出した場合 `true`。コメント表示スタイル切替に使用 |
| `comment_id` | `int` | 保存されたコメントのID |
| `record_type` | `str` | 分析に使ったトリガー記録タイプ |
| `analyzed_at` | `str` | 分析日時（ISO 8601形式） |
| `model_name` | `str` | 使用したAIモデル名 |

**`has_concern: true` の例**（コメントが警告スタイルで表示）:
```json
{
  "feedback": "直近24時間でうんちが1回と少ない傾向です。ミルクの量が不足している可能性があります。授乳量を確認してみてください。",
  "has_concern": true,
  "comment_id": 457,
  ...
}
```

### エラーレスポンス

| HTTP Status | 条件 |
|------------|------|
| 403 | アクセス権限なし |
| 404 | baby_id 不存在、または record_id が baby_id に属さない |
| 503 | AI API障害（コメントは保存されない） |

---

## 4. AIプロンプト設計

### システムプロンプト

```
あなたは育児記録アシスタントです。
赤ちゃんの直近の記録を分析し、親に向けて温かく簡潔なフィードバックを日本語で返してください。
以下のJSON形式のみで返してください（他のテキストは含めないこと）:
{"feedback": "フィードバックテキスト", "has_concern": true/false}

フィードバックは50〜150字程度、1〜2文にまとめてください。
has_concern は以下の場合に true としてください（いずれかに該当すれば）:
- 授乳間隔が6時間以上空いている（新生児〜3ヶ月）
- 直近24時間の授乳回数が5回未満（新生児期）
- おしっこが12時間以上記録されていない
- うんちが24時間で0回（または極端に少ない傾向がメモで示されている）
- 成長記録で体重が前回より有意に減少している（100g以上の減少）
- メモに「元気がない」「ぐったり」「熱がある」などの懸念ワードがある
上記に該当しない場合は has_concern: false とし、ポジティブなコメントを返してください。
医療診断は行わず「確認してみてください」「小児科に相談することをお勧めします」程度にとどめてください。
```

### ユーザープロンプト（動的生成）

```
{baby_name}ちゃんの記録です。今ちょうど「{record_type_ja}」を記録しました。

【直近24時間の記録】
{records_text}

この記録を踏まえて、{trigger_focus}を中心に分析し、JSONで返してください。
```

`{records_text}` の形式（全記録タイプを横断してテキスト化）:
```
【授乳】3回
  11:00 母乳 15分 (メモ: 途中で泣いた)
  14:30 ミルク 120ml

【おむつ】5回
  10:00 おしっこ
  15:00 両方 (メモ: うんちが少ない)

【メモ】
  09:30 機嫌が良い
```

成長記録のみ前回値を追加:
```
【前回の成長記録】
  {前回日付}: 体重 {X}g / 身長 {Y}cm
【今回の成長記録】
  {今回日付}: 体重 {X2}g（前回比: +{diff}g）
```

### モデル設定

AI フィードバックの動作は、`/settings/ai` (管理画面) の以下の設定値に依存する。詳細は `ai_settings.md` を参照。

| 設定キー | 説明 | デフォルト |
|--------|------|------|
| `llm_model` | 使用するモデル名 | `gemini-1.5-pro` |
| `ai_enabled_feedback` | フィードバック機能の有効化 | `true` |
| `llm_temperature` | 生成時の多様性 | `0.5` |
| `llm_max_tokens` | 最大出力トークン数 | `300` |

---

## 5. バックエンド実装計画

### 新規・変更ファイル

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `app/models/comment.py` | **変更** | `is_ai_generated`, `ai_has_concern` フィールド追加 |
| `app/schemas/comment.py` | **変更** | AIコメント関連フィールドをスキーマに追加 |
| `app/schemas/ai_feedback.py` | **新規作成** | リクエスト/レスポンス Pydantic スキーマ |
| `app/services/ai_feedback.py` | **新規作成** | フィードバック生成・コメント保存ロジック |
| `app/routers/ai_feedback.py` | **新規作成** | APIエンドポイント |
| `app/main.py` | **変更** | router 登録追加 |

**DBマイグレーション必要**（コメントモデルへのカラム追加）。

### コメントモデルへの追加フィールド

```python
# app/models/comment.py への追加（既存モデルを変更）
is_ai_generated = Column(Boolean, default=False, nullable=False)
ai_has_concern = Column(Boolean, default=False, nullable=True)  # has_concern: true/false
```

`user_id` は `NULL` に設定（AIによる自動投稿はシステム生成として扱う）。
ただし、既存の外部キー制約次第では `nullable=True` への変更も必要。

### 再利用する既存実装

- `app/services/ai_summary.py`: `get_llm_client()`, 記録取得・テキスト化のパターン
- `app/routers/ai_summary.py`: `openai.APIError` → 503 変換パターン
- `app/dependencies.py`: `get_current_user()`, `verify_baby_access()`
- `app/models/comment.py`: 既存のコメントモデル（フィールド追加して再利用）

### `app/services/ai_feedback.py` の主要関数

```python
def _verify_record_ownership(db, record_type, record_id, baby_id) -> None:
    """record_id と baby_id の対応を確認（なりすまし防止）"""

def build_feedback_prompt(db, baby_id, baby_name, record_type, record_id) -> str:
    """直近24時間の全記録を取得してプロンプト組み立て"""

def generate_record_feedback(
    db, baby_id, baby_name, record_type, record_id
) -> tuple[str, bool, str]:
    """
    AIがJSON形式で返した結果をパースして (feedback_text, has_concern, model_name) を返す。
    JSON パース失敗時は has_concern=False としてフォールバック。
    """

def save_ai_comment(db, record_type, record_id, feedback, has_concern) -> Comment:
    """
    フィードバックをコメントとして保存する。
    is_ai_generated=True, ai_has_concern=has_concern, user_id=None でコメントを作成。
    """
```

---

## 6. フロントエンド実装計画

### 新規・変更ファイル

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `frontend/hooks/useRecordFeedback.ts` | **新規作成** | フィードバック取得・コメント保存フック |
| `frontend/components/records/CommentSection.tsx` | **変更** | AIコメントの特別スタイル追加 |
| `frontend/app/(dashboard)/feeding/page.tsx` | **変更** | useRecordFeedback 統合 |
| `frontend/app/(dashboard)/diaper/page.tsx` | **変更** | useRecordFeedback 統合 |
| `frontend/app/(dashboard)/growth/page.tsx` | **変更** | useRecordFeedback 統合 |
| `frontend/app/(dashboard)/note/page.tsx` | **変更** | useRecordFeedback 統合 |

`RecordFeedbackCard.tsx` の新規作成は不要（コメントUIを再利用するため）。

### `useRecordFeedback.ts` 仕様

```typescript
const { isLoading, error, triggerFeedback } = useRecordFeedback(babyId)

// 記録保存後に呼び出す（awaitしない）
triggerFeedback('feeding', newRecord.id)
```

- `triggerFeedback` はバックエンドの `POST /api/babies/{baby_id}/record-feedback` を呼ぶ
- 完了後にコメント一覧の SWR キャッシュを `mutate()` して自動更新
- 10秒タイムアウト（AbortController）
- エラー時は Toast でエラー通知（コンパクトに）

### 各ページへの統合パターン

```typescript
// feeding/page.tsx の例
const { triggerFeedback } = useRecordFeedback(babyId)

const handleAddFeeding = async (data: FeedingCreate) => {
  const newRecord = await api.post<FeedingResponse>('/feedings/', data)
  mutate() // 記録一覧を即更新
  triggerFeedback('feeding', newRecord.id) // AI分析は非同期（awaitしない）
}
```

### コメント表示のAIスタイル変更

`CommentSection.tsx` でコメントの `is_ai_generated` フラグを参照して表示を切り替える：

**AIコメント（通常）**:
```
┌─────────────────────────────────────────┐
│ 🤖 AIフィードバック                      │
│ 今日は3時間おきに授乳できています。安定  │
│ したペースが続いています。               │
└─────────────────────────────────────────┘
```
スタイル: `bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100`

**AIコメント（警告 / has_concern: true）**:
```
┌─────────────────────────────────────────┐
│ ⚠️ AIフィードバック（要確認）            │  ← 黄色・オレンジ系ヘッダー
│ 直近24時間でうんちが1回と少ない傾向です。│
│ ミルクの量が不足している可能性があります。│
└─────────────────────────────────────────┘
```
スタイル: `bg-amber-50 dark:bg-amber-950/30 border-amber-200`

---

## 7. UX・表示仕様

### コメント欄での表示位置

AIコメントは既存のコメント一覧の中に自動追加される。
コメントは時系列順で表示されるため、記録直後のAIコメントが最上部または最下部に表示される（既存の並び順に依存）。

### ローディング中の表示

フォーム送信後、AI分析中は既存のコメントアイコン（メッセージアイコン）の横にスピナーを小さく表示するか、または単に非同期で待つ（UI上での明示的なローディングは軽量に抑える）。

### リセット不要

コメントとしてDB保存されるため、「閉じる」「リセット」の概念は不要。
記録一覧を見返したときにコメントアイコンの件数が増えており、コメントを開くとAIフィードバックが確認できる。

---

## 8. 非機能要件

- **応答速度**: 記録保存は即座に完了し、AI分析は非同期（2〜5秒後にコメントが追加される）
- **エラーハンドリング**: AI API障害時はコメントを保存せず、Toast でエラーを軽く通知。記録データに影響なし
- **セキュリティ**: `_verify_record_ownership()` で record_id と baby_id の対応を必ず確認
- **DB**: コメントモデルに `is_ai_generated`, `ai_has_concern` フィールド追加（マイグレーション必要）
- **openapi.json 更新**: 実装後に `python scripts/export_openapi.py` を必ず実行

---

## 実装チェックリスト

### バックエンド
- [ ] `app/models/comment.py` に `is_ai_generated`, `ai_has_concern` フィールド追加
- [ ] `app/schemas/comment.py` に AIコメント関連フィールドを追加
- [ ] Alembic マイグレーション作成・適用 (`alembic revision --autogenerate`)
- [ ] `app/schemas/ai_feedback.py` 作成（`RecordFeedbackRequest`, `RecordFeedbackResponse`）
- [ ] `app/services/ai_feedback.py` 作成（`_verify_record_ownership`, `build_feedback_prompt`, `generate_record_feedback`, `save_ai_comment`）
- [ ] `app/routers/ai_feedback.py` 作成
- [ ] `app/main.py` に router 登録
- [ ] `python scripts/export_openapi.py` 実行 → `frontend/openapi.json` コミット

### フロントエンド
- [ ] `frontend/hooks/useRecordFeedback.ts` 作成（`triggerFeedback`, SWR mutate）
- [ ] `frontend/components/records/CommentSection.tsx` 変更（AIコメントスタイル追加）
- [ ] feeding/diaper/growth/note の各ページに `useRecordFeedback` 統合
- [ ] `cd frontend && pnpm build` でビルド確認

---

## 検証方法

1. **バックエンド単体**: `pytest` で `POST /api/babies/{baby_id}/record-feedback` のテスト
2. **E2E（正常値）**: 授乳記録を保存 → 数秒後にコメント欄にAIコメントが追加される
3. **E2E（異常値）**: おむつ記録のメモに「うんちが少ない」と書いて保存 → 警告スタイルのAIコメントが追加される
4. **エラーケース**: ネットワーク切断時にコメントは追加されず、Toastでエラーが表示される
5. **セキュリティ**: 別ファミリーの record_id を指定して 404 が返ること確認

---

## 参照すべき既存ファイル

- `app/models/comment.py` — コメントモデルの現状確認（フィールド追加前）
- `app/schemas/comment.py` — コメントスキーマの現状
- `app/routers/` 配下のコメント関連ルーター（`.specify/specs/social/record_comments.md` 参照）
- `app/services/ai_summary.py` — `get_llm_client()` と記録取得パターン
- `frontend/components/records/CommentSection.tsx` — AIスタイル追加の変更対象
