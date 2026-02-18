# AI育児日誌生成 仕様書 (AI Daily Summary Specification)

## 概要

1日の育児記録（授乳・睡眠・おむつ・成長）を集計し、OpenAI GPT-4o mini を用いて自然な文体の育児日記（日誌）を自動生成する機能。
生成した日誌はユーザーが手動編集でき、任意の日付の日誌を一覧・閲覧・削除できる。

---

## 背景・設計方針

- 1日の記録をまとめて振り返る「育児日記」のニーズに応える。
- 手動で日記を書く手間をなくし、記録データから自動的に文章化する。
- 生成内容はユーザーが自由に編集できる（AI の生成物を確定にしない）。
- AI API 障害時は HTTP 503 を返し、記録を壊さない。

---

## ユーザーストーリー

- **毎日の変化に気づきたい**
    - ユーザーは、日々の記録だけでなく「最近うんちが緩い」「夜泣きが増えてきた」といった中期的な変化をAIに指摘してもらい、育児の気づきを得たい。
    - **Acceptance Criteria**: 日誌生成時に、過去数日間の傾向（特徴）を踏まえたコメントが含まれること。

- **成長の連続性を感じたい**
    - ユーザーは、昨日の出来事（例: 初めて寝返りした）を踏まえた今日の日記（例: 今日も寝返りを頑張っていた）を生成してほしい。
    - **Acceptance Criteria**: `babies` テーブルに保存された「特徴（characteristics）」がプロンプトに反映され、日誌生成後にその特徴が更新されること。

---

## 用語定義

| 用語 | 定義 |
|------|------|
| `generated_content` | AI が生成した日誌テキスト（不変） |
| `edited_content` | ユーザーが手動編集したテキスト（nullable） |
| `display_content` | 表示用テキスト。`edited_content ?? generated_content` |
| `is_edited` | `edited_content` が存在する場合 `true` |
| `summary_date` | 日誌の対象日（`YYYY-MM-DD`、タイムゾーンは JST） |

---

## データベース設計

### 新規テーブル: `daily_summaries`

```python
# app/models/ai_summary.py

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Date, DateTime,
    ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.sql import func
from .base import Base


class DailySummary(Base):
    __tablename__ = "daily_summaries"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    summary_date = Column(Date, nullable=False)
    generated_content = Column(Text, nullable=False)
    edited_content = Column(Text, nullable=True)
    is_edited = Column(Boolean, nullable=False, default=False)
    model_name = Column(String, nullable=True)          # 生成に使用したモデル名
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("baby_id", "summary_date", name="uix_daily_summary_baby_date"),
        Index("idx_daily_summary_baby_date", "baby_id", "summary_date"),


---

## バックエンド設計

### 新規・変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `app/models/ai_summary.py` | **新規作成** | `DailySummary` モデル |
| `app/schemas/ai_summary.py` | **新規作成** | Pydantic スキーマ |
| `app/routers/ai_summary.py` | **新規作成** | AI日誌 API エンドポイント |
| `app/services/ai_summary.py` | **新規作成** | AI生成ロジック（OpenAI 呼び出し・プロンプト生成） |
| `app/models/__init__.py` | **変更** | `DailySummary` をインポートに追加 |
| `app/main.py` | **変更** | `ai_summary` router を `include_router` |

---

### Pydantic スキーマ

```python
# app/schemas/ai_summary.py

from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class DailySummaryCreate(BaseModel):
    """POST リクエストボディ: 日誌生成（upsert）"""
    summary_date: date


class DailySummaryEdit(BaseModel):
    """PATCH リクエストボディ: 手動編集"""
    edited_content: Optional[str] = None
    # edited_content=None → 編集をクリアして generated_content に戻す


class DailySummaryResponse(BaseModel):
    """日誌レスポンス共通"""
    id: int
    baby_id: int
    user_id: Optional[int]
    summary_date: date
    display_content: str          # edited_content ?? generated_content
    generated_content: str
    edited_content: Optional[str]
    is_edited: bool
    model_name: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

> **`display_content` の組み立て**: バックエンドの `@property` または router 内で `edited_content or generated_content` として計算してレスポンスに含める。

---

### API エンドポイント

#### `POST /api/babies/{baby_id}/daily-summary`

**概要**: 指定日の育児日誌を AI 生成（upsert）。同一日に既存レコードがあれば `generated_content` を上書き（`is_edited=false` の場合のみ）。

**権限**: `verify_baby_access(db, baby_id, current_user.id)` で検証（baby レベル）

**リクエストボディ**:

```json
{ "summary_date": "2026-02-14" }
```

**処理詳細**:

1. `verify_baby_access()` でアクセス検証。
2. 対象日の全記録を集計（後述のプロンプト生成参照）。
3. 対象日の記録が 0 件の場合は `400 Bad Request`（「記録がない日は生成できません」）。
4. OpenAI API (`gpt-4o-mini`) を呼び出して日誌テキストを生成。
5. OpenAI API 障害時: `503 Service Unavailable`（「AI サービスが一時的に利用できません」）。
6. 既存レコードが存在し `is_edited=true` の場合: 再生成しない（`edited_content` を保護）。再生成したい場合はフロントエンドから明示的にフラグ付き再生成を行う（将来の拡張）。
7. `DailySummary` を upsert して返す。

**レスポンス** (`201 Created`): `DailySummaryResponse`

**エラーレスポンス**:

- `400 Bad Request`: 対象日の記録が 0 件
- `404 Not Found`: `baby_id` が存在しない・アクセス不可
- `503 Service Unavailable`: OpenAI API 障害

---

#### `GET /api/babies/{baby_id}/daily-summary/{summary_date}`

**概要**: 指定日の日誌を 1 件取得。

**権限**: `verify_baby_access(db, baby_id, current_user.id)`

**パスパラメータ**: `summary_date` は `YYYY-MM-DD` 形式

**レスポンス** (`200 OK`): `DailySummaryResponse`

**エラーレスポンス**:

- `404 Not Found`: 指定日の日誌が存在しない

---

#### `GET /api/babies/{baby_id}/daily-summary`

**概要**: 日誌一覧を取得（直近 30 日、降順）。

**権限**: `verify_baby_access(db, baby_id, current_user.id)`

**クエリパラメータ** (optional):

- `limit`: 取得件数（デフォルト 30、最大 90）
- `offset`: スキップ件数（デフォルト 0）

**レスポンス** (`200 OK`): `List[DailySummaryResponse]`

---

#### `PATCH /api/babies/{baby_id}/daily-summary/{summary_date}`

**概要**: 日誌テキストを手動編集する。

**権限**: `verify_baby_access(db, baby_id, current_user.id)`

**リクエストボディ**:

```json
{ "edited_content": "今日はレンくんがはじめて寝返りをした！" }
```

**処理詳細**:

1. `edited_content` が `None` または空文字の場合: `edited_content=null`, `is_edited=false` にリセット。
2. それ以外: `edited_content` を更新し `is_edited=true` にセット。
3. `updated_at` を現在時刻に更新。

**レスポンス** (`200 OK`): `DailySummaryResponse`

---

#### `DELETE /api/babies/{baby_id}/daily-summary/{summary_date}`

**概要**: 指定日の日誌を削除。

**権限**: `verify_baby_access(db, baby_id, current_user.id)`

**レスポンス** (`200 OK`):

```json
{ "message": "Deleted" }
```

---

### AI 生成サービス

```python
# app/services/ai_summary.py

import os
from datetime import date, datetime, timedelta, timezone
from typing import Tuple
from sqlalchemy.orm import Session
from openai import OpenAI

from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.note import Note


def get_llm_client() -> Tuple[OpenAI, str]:
    """(client, model_name) を返す"""
    provider = os.environ.get("LLM_PROVIDER", "openai").lower()
    api_key = os.environ.get("LLM_API_KEY") or os.environ.get("OPENAI_API_KEY")
    model = os.environ.get("LLM_MODEL")

    if provider == "google":
        client = OpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        model = model or "gemini-2.0-flash"
    else:
        client = OpenAI(api_key=api_key)
        model = model or "gpt-4o-mini"

    return client, model


def build_daily_prompt(
    db: Session,
    baby_id: int,
    baby_name: str,
    target_date: date,
) -> Tuple[str, int, str]:
    """プロンプト文字列、記録件数の合計、記録テキスト自体を返す。"""
    # JST の日付範囲を UTC に変換して DateTime フィルタ用に使用
    JST = timezone(timedelta(hours=9))
    day_start = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0, tzinfo=JST)
    day_end = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59, tzinfo=JST)

    feedings = (
        db.query(Feeding)
        .filter(
            Feeding.baby_id == baby_id,
            Feeding.feeding_time >= day_start,
            Feeding.feeding_time <= day_end,
        )
        .order_by(Feeding.feeding_time)
        .all()
    )

    sleeps = (
        db.query(Sleep)
        .filter(
            Sleep.baby_id == baby_id,
            Sleep.start_time >= day_start,
            Sleep.start_time <= day_end,
        )
        .order_by(Sleep.start_time)
        .all()
    )

    diapers = (
        db.query(Diaper)
        .filter(
            Diaper.baby_id == baby_id,
            Diaper.change_time >= day_start,
            Diaper.change_time <= day_end,
        )
        .order_by(Diaper.change_time)
        .all()
    )

    notes = (
        db.query(Note)
        .filter(
            Note.baby_id == baby_id,
            Note.note_time >= day_start,
            Note.note_time <= day_end,
        )
        .order_by(Note.note_time)
        .all()
    )

    growths = (
        db.query(Growth)
        .filter(
            Growth.baby_id == baby_id,
            Growth.date == target_date,
        )
        .all()
    )

    total_records = len(feedings) + len(sleeps) + len(diapers) + len(notes) + len(growths)

    date_str = target_date.strftime("%Y年%m月%d日")
    lines = [f"{baby_name}ちゃんの{date_str}の育児記録です。", ""]

    if feedings:
        lines.append(f"【授乳】{len(feedings)}回")
        for f in feedings:
            t = f.feeding_time.strftime("%H:%M")
            kind = {"BREAST": "母乳", "BOTTLE": "ミルク", "MIXED": "混合"}.get(
                str(f.feeding_type.value) if hasattr(f.feeding_type, "value") else str(f.feeding_type), str(f.feeding_type)
            )
            detail = f"  {t} {kind}"
            if f.amount_ml:
                detail += f" {int(f.amount_ml)}ml"
            if f.duration_minutes:
                detail += f" {f.duration_minutes}分"
            if f.notes:
                detail += f" (メモ: {f.notes})"
            lines.append(detail)
        lines.append("")

    if sleeps:
        lines.append(f"【睡眠】{len(sleeps)}回")
        for s in sleeps:
            start = s.start_time.strftime("%H:%M")
            if s.end_time:
                end = s.end_time.strftime("%H:%M")
                diff = s.end_time - s.start_time
                mins = int(diff.total_seconds() / 60)
                line = f"  {start}〜{end}（{mins}分）"
            else:
                line = f"  {start}〜（継続中）"

            if s.notes:
                line += f" (メモ: {s.notes})"
            lines.append(line)
        lines.append("")

    if diapers:
        lines.append(f"【おむつ】{len(diapers)}回")
        for d in diapers:
            t = d.change_time.strftime("%H:%M")
            kind = {"WET": "おしっこ", "DIRTY": "うんち", "BOTH": "両方"}.get(
                str(d.diaper_type.value) if hasattr(d.diaper_type, "value") else str(d.diaper_type), str(d.diaper_type)
            )
            line = f"  {t} {kind}"
            if d.notes:
                line += f" (メモ: {d.notes})"
            lines.append(line)
        lines.append("")

    if notes:
        lines.append(f"【その他の様子・メモ】")
        for n in notes:
            t = n.note_time.strftime("%H:%M")
            lines.append(f"  {t} {n.content}")
        lines.append("")

    if growths:
        lines.append("【成長記録】")
        for g in growths:
            parts = []
            if g.weight is not None:
                parts.append(f"体重 {g.weight / 1000:.3f}kg")
            if g.height is not None:
                parts.append(f"身長 {g.height}cm")
            if g.head_circumference is not None:
                parts.append(f"頭囲 {g.head_circumference}cm")
            if parts:
                lines.append(f"  {' / '.join(parts)}")
        lines.append("")

    records_text = "\n".join(lines)

    prompt = f"""以下は赤ちゃんの育児記録です。この記録をもとに、親が読んで温かい気持ちになれるような育児日誌を100〜200字程度で書いてください。

記録の羅列ではなく、1日の流れを物語風にまとめ、赤ちゃんの様子や成長を感じられる文章にしてください。

{records_text}
育児日誌（100〜200字）:"""

    return prompt, total_records, records_text


def update_baby_characteristics(
    db: Session,
    baby_id: int,
    baby_name: str,
    target_date: date,
    current_characteristics: str,
    daily_record_text: str,
    generated_diary: str,
    model_name: str
) -> None:
    """日誌生成後に赤ちゃんの特徴（characteristics）を更新する。"""
    from app.models.baby import Baby

    # プロンプト構築
    update_prompt = (
        f"以下は赤ちゃん（{baby_name}）の現在記録されている「特徴・傾向」と、"
        f"本日（{target_date}）の育児記録、および生成された日記です。\n\n"
        f"【現在の特徴】\n{current_characteristics or '（なし）'}\n\n"
        f"【本日の記録】\n{daily_record_text}\n\n"
        f"【生成された日記】\n{generated_diary}\n\n"
        f"これらを踏まえて、赤ちゃんの特徴を更新してください。\n"
        f"「最近うんちが緩い」「夜泣き気味」など、数日〜数週間のスパンで続く傾向があれば残し、"
        f"解消されたものは削除するか「解消された」と更新してください。\n"
        f"一時的な出来事（今日だけミルクをこぼした等）は特徴に含めないでください。\n"
        f"出力は更新後の特徴テキストのみ（箇条書き推奨）にしてください。"
    )

    try:
        client, _ = get_llm_client()
        # 更新用モデルは軽量モデルでも良いが、指示順守のため生成と同じモデルまたは安定したモデルを使用
        # ここでは generate と同じモデルを使うか、デフォルト設定に従う

        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "あなたは赤ちゃんの成長や体調の変化を長期的に観察するアシスタントです。"},
                {"role": "user", "content": update_prompt},
            ],
            max_tokens=400,
            temperature=0.5,
        )
        new_characteristics = response.choices[0].message.content.strip()

        # DB更新
        baby = db.query(Baby).filter(Baby.id == baby_id).first()
        if baby:
            from app.services.baby import update_baby
            update_baby(db, baby, {"characteristics": new_characteristics})

    except Exception as e:
        print(f"Failed to update characteristics: {e}")
        # 特徴更新の失敗は日誌生成自体を失敗させない（ログ出力のみ）


def generate_daily_summary(
    db: Session,
    baby_id: int,
    baby_name: str,
    target_date: date,
) -> Tuple[str, str]:
    """(generated_content, model_name) を返す。
    記録が0件の場合は ValueError を raise。
    API障害時は openai.APIError を伝播。
    """
    prompt, total_records, records_text = build_daily_prompt(db, baby_id, baby_name, target_date)

    if total_records == 0:
        raise ValueError("この日の育児記録がありません。")

    # 現在の特徴を取得してプロンプトに追加
    from app.models.baby import Baby
    baby = db.query(Baby).filter(Baby.id == baby_id).first()
    current_characteristics = baby.characteristics if baby else None

    if current_characteristics:
        prompt = (
            f"【これまでの赤ちゃんの様子・特徴】\n{current_characteristics}\n\n" 
            + prompt
            + "\n\n上記の特徴を踏まえつつ、本日の記録に矛盾があれば今日の記録を優先し、"
            "「いつもは〜だが今日は〜だった」のように変化に触れてください。"
        )

    client, model_name = get_llm_client()

    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {
                "role": "system",
                "content": "あなたは育児記録をもとに、温かみのある育児日誌を書くアシスタントです。",
            },
            {"role": "user", "content": prompt},
        ],
        max_tokens=600,
        temperature=0.7,
    )

    content = response.choices[0].message.content or ""
    generated_text = content.strip()

    # 特徴を更新 (同期実行)
    update_baby_characteristics(
        db,
        baby_id,
        baby_name,
        target_date,
        current_characteristics,
        records_text,
        generated_text,
        model_name
    )

    return generated_text, model_name
```

---

### `app/main.py` への router 登録

```python
from app.routers import ai_summary
app.include_router(ai_summary.router)
```

---

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API キー | ✅ |

> Gemini への切替方法: `app/services/ai_summary.py` の `generate_daily_summary()` 関数内の client 部分を差し替えるだけで切替可能（インターフェースは変えない）。

---

## フロントエンド設計

### 新規・変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `frontend/hooks/useDailySummary.ts` | **新規作成** | SWR フック + API ミューテーション関数 |
| `frontend/app/(dashboard)/diary/page.tsx` | **新規作成** | 育児日誌一覧・詳細ページ |
| `frontend/components/diary/DiarySummaryCard.tsx` | **新規作成** | 日誌カードコンポーネント |
| `frontend/components/diary/DiaryEditDialog.tsx` | **新規作成** | 手動編集ダイアログ |

---

### `useDailySummary.ts`

```typescript
// frontend/hooks/useDailySummary.ts

import useSWR from "swr";
import { fetcher } from "@/lib/api";

export type DailySummary = {
  id: number;
  baby_id: number;
  user_id: number | null;
  summary_date: string;           // "YYYY-MM-DD"
  display_content: string;
  generated_content: string;
  edited_content: string | null;
  is_edited: boolean;
  model_name: string | null;
  created_at: string;
  updated_at: string;
};

/** 日誌一覧取得 */
export function useDailySummaries(babyId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<DailySummary[]>(
    babyId ? `/babies/${babyId}/daily-summary` : null,
    fetcher
  );
  return { summaries: data, isLoading, isError: error, mutate };
}

/** 指定日の日誌取得 */
export function useDailySummary(babyId: number | null, summaryDate: string | null) {
  const { data, error, isLoading, mutate } = useSWR<DailySummary>(
    babyId && summaryDate ? `/babies/${babyId}/daily-summary/${summaryDate}` : null,
    fetcher
  );
  return { summary: data, isLoading, isError: error, mutate };
}

/** 日誌生成（upsert） */
export async function generateDailySummary(
  babyId: number,
  summaryDate: string
): Promise<DailySummary> {
  const res = await fetch(`/api/babies/${babyId}/daily-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ summary_date: summaryDate }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "日誌の生成に失敗しました");
  }
  return res.json();
}

/** 手動編集 */
export async function editDailySummary(
  babyId: number,
  summaryDate: string,
  editedContent: string | null
): Promise<DailySummary> {
  const res = await fetch(`/api/babies/${babyId}/daily-summary/${summaryDate}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ edited_content: editedContent }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "日誌の編集に失敗しました");
  }
  return res.json();
}

/** 削除 */
export async function deleteDailySummary(
  babyId: number,
  summaryDate: string
): Promise<void> {
  const res = await fetch(`/api/babies/${babyId}/daily-summary/${summaryDate}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "日誌の削除に失敗しました");
  }
}
```

---

### 画面構成

#### 育児日誌一覧ページ (`/diary`)

```
┌─────────────────────────────────────────┐
│ ← 戻る    育児日誌                      │  ← sticky header
└─────────────────────────────────────────┘

  [今日の日誌を生成]  ← 当日に日誌がない場合のみ表示

  ┌───────────────────────────────────────┐
  │ 2026-02-14 (土)                  ✏️🗑️ │
  │ 今日はレンくんがはじめて寝返り...      │
  │                     [✏️編集済み]       │
  └───────────────────────────────────────┘

  ┌───────────────────────────────────────┐
  │ 2026-02-13 (金)                  ✏️🗑️ │
  │ 授乳7回、睡眠合計12時間のおだやかな日... │
  └───────────────────────────────────────┘
  ...
```

#### 日誌生成中のローディング表示

- 「AIが日誌を生成中です...」スピナー表示
- 生成中はボタンを `disabled` にする（二重送信防止）

#### 手動編集ダイアログ

```
┌────────────────────────────────────────────┐
│  育児日誌を編集                             │
│  ─────────────────────────────────────────  │
│  ┌──────────────────────────────────────┐   │
│  │ 今日はレンくんがはじめて...           │   │
│  │ （テキストエリア、高さ自動調整）       │   │
│  └──────────────────────────────────────┘   │
│  ※ 空欄にするとAI生成テキストに戻ります     │
│                                            │
│              [キャンセル] [保存]            │
└────────────────────────────────────────────┘
```

---

## 権限制御

| 操作 | admin | member（許可） | member（制限） |
|------|-------|--------------|--------------|
| 日誌生成 | ✅ | ✅ | `baby` レベル制限時 403 |
| 日誌閲覧 | ✅ | ✅ | `baby` レベル制限時 403 |
| 日誌編集 | ✅ | ✅ | `baby` レベル制限時 403 |
| 日誌削除 | ✅ | ✅ | `baby` レベル制限時 403 |

> **情報漏洩に関する注意**: AI日誌の生成は、対象日の**すべての記録（閲覧制限の有無を問わない）**をソースとして行われる。そのため、例えば「授乳記録」の閲覧制限がかかっているユーザーであっても、日誌を閲覧できる権限があれば、日誌の文章を通じて「今日は7回授乳した」などの情報を得ることが可能である。これは日誌の「1日を包括的に振り返る」という性質上、許容される動作とする。

AI日誌の操作は `record_type` 単位の権限制御対象外（`baby` レベルのみ検証）。

---

## エラーハンドリング

| エラー条件 | バックエンド | フロントエンド |
|-----------|------------|--------------|
| 対象日の記録が 0 件 | `400 Bad Request` | トースト「この日の記録がないため生成できません」 |
| OpenAI API 障害 | `503 Service Unavailable` | トースト「AIサービスが一時的に利用できません。しばらく後に再試行してください」 |
| 既に `is_edited=true` の日誌に再生成 | 再生成をスキップ（既存レコードをそのまま返す） | 「手動編集済みのため再生成されませんでした」メッセージ |
| 存在しない日誌を取得・編集・削除 | `404 Not Found` | トースト「日誌が見つかりません」 |
| 未認証 | `401 Unauthorized` | リダイレクト（既存の認証ガード） |
| アクセス権限なし | `403 Forbidden` | トースト「アクセス権限がありません」 |

---

## 実装チェックリスト

### バックエンド

- [x] `app/models/ai_summary.py` 作成（`DailySummary` モデル）
- [x] `app/models/__init__.py` に `DailySummary` インポート追加
- [x] `alembic revision --autogenerate -m "add daily_summaries table"` 実行
- [x] マイグレーション内容確認（`daily_summaries` テーブル新規作成のみ）
- [x] `alembic upgrade head` でマイグレーション適用
- [x] `app/schemas/ai_summary.py` 作成（`DailySummaryCreate`, `DailySummaryEdit`, `DailySummaryResponse`）
- [x] `app/services/ai_summary.py` 作成
    - [x] `build_daily_prompt()` 実装（Feeding/Sleep/Diaper/Growth 集計）
    - [x] `build_daily_prompt()` 更新: 各記録の `notes` をプロンプトに含めるよう改修
    - [x] `generate_daily_summary()` 実装（OpenAI 呼び出し）
    - [x] `APIError` を raise して router 側で 503 に変換する設計を確認
- [x] `app/routers/ai_summary.py` 作成
    - [x] `POST /api/babies/{baby_id}/daily-summary` 実装（upsert）
    - [x] `GET  /api/babies/{baby_id}/daily-summary` 実装（一覧）
    - [x] `GET  /api/babies/{baby_id}/daily-summary/{summary_date}` 実装
    - [x] `PATCH /api/babies/{baby_id}/daily-summary/{summary_date}` 実装
    - [x] `DELETE /api/babies/{baby_id}/daily-summary/{summary_date}` 実装
    - [x] 全エンドポイントで `verify_baby_access()` 呼び出しを確認
    - [x] OpenAI `APIError` を 503 に変換するエラーハンドラを確認
- [x] `app/main.py` に `ai_summary` router を登録
- [x] `.env` に `OPENAI_API_KEY` を設定（ローカル開発用）
- [x] Render 環境変数に `OPENAI_API_KEY` を設定（本番用）

### フロントエンド

- [x] `frontend/hooks/useDailySummary.ts` 作成
    - [x] `useDailySummaries()` SWR フック
    - [x] `useDailySummary()` SWR フック
    - [x] `generateDailySummary()` 関数
    - [x] `editDailySummary()` 関数
    - [x] `deleteDailySummary()` 関数
- [x] `frontend/components/diary/DiarySummaryCard.tsx` 作成
    - [x] `is_edited` バッジ表示（「✏️編集済み」）
    - [x] 編集・削除ボタン
- [x] `frontend/components/diary/DiaryEditDialog.tsx` 作成
    - [x] テキストエリア（高さ自動調整）
    - [x] 空欄時に `edited_content=null` として PATCH
    - [x] 保存後に `mutate()` でキャッシュ更新
- [x] `frontend/components/diary/DiaryDeleteDialog.tsx` 作成
- [x] `frontend/app/(dashboard)/diary/page.tsx` 作成
    - [x] `useDailySummaries()` でデータ取得
    - [x] 「今日の日誌を生成」ボタン（当日未生成の場合のみ表示）
    - [x] 生成中のスピナー表示・ボタン disabled
    - [x] 削除確認ダイアログ
- [x] `cd frontend && pnpm build` でビルド確認

### 長期的特徴（Long-term Characteristics）

- [x] `babies` テーブルに `characteristics` カラム追加 (Alembic)
- [x] `app/services/ai_summary.py` 改修
    - [x] `build_daily_prompt` の返り値変更 (record_textを含む)
    - [x] `generate_daily_summary` で `characteristics` を取得・プロンプト反映
    - [x] `update_baby_characteristics` 実装
- [x] 検証スクリプト `scripts/verify_characteristics.py` で動作確認

---

## 参照先ドキュメント

- `.specify/specs/settings/baby_permissions.md` — `verify_baby_access()` の仕様
- `.specify/specs/ui/ui_design_system.md` — カラーパレット・コンポーネントデザイン
- `app/models/feeding.py` — `Feeding` モデル
- `app/models/sleep.py` — `Sleep` モデル
- `app/models/diaper.py` — `Diaper` モデル
- `app/models/growth.py` — `Growth` モデル
- `app/dependencies.py` — `verify_baby_access()` 実装
- `frontend/hooks/useData.ts` — SWR フックのパターン参照
