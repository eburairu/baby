# 育児チャットボット (RAG) 仕様書 (AI Chatbot RAG Specification)

## 概要

過去の育児記録をコンテキスト（RAG）として活用し、育児に関するパーソナライズされた相談ができるチャットボット機能。
直近 7 日分の記録サマリーをシステムプロンプトに埋め込み、OpenAI GPT-4o mini が回答を生成する。
チャット履歴はセッション単位で DB に保存し、後から参照できる。

---

## 背景・設計方針

- 「うちの子の睡眠時間は足りていますか？」など、自分の赤ちゃんのデータに基づいた相談を実現する。
- AI は医療行為を行わない。免責事項をシステムプロンプトとフロントエンドUIに明記する。
- 会話の文脈を保つため、直近 5 件のメッセージ履歴を LLM に渡す。
- セッションは赤ちゃん単位で管理し、複数のトピックを分けて会話できる。

---

## 用語定義

| 用語 | 定義 |
|------|------|
| セッション | 1つのトピックに関する会話の単位。タイトルは最初の質問から自動生成 |
| RAGコンテキスト | 直近7日分の記録サマリー。各リクエスト時にDBから動的に生成してシステムプロンプトに含める |
| 会話履歴 | セッション内の直近5件のメッセージ（user + assistant 交互）を LLM に渡す |
| 医療免責 | AI は診断・処方を行わない旨の明示的なメッセージ |

---

## データベース設計

### 新規テーブル: `chat_sessions`

```python
# app/models/chatbot.py

from sqlalchemy import (
    Column, Integer, String, Text, DateTime,
    ForeignKey, Index
)
from sqlalchemy.sql import func
from .base import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(100), nullable=False)    # 最初の質問から最大50文字
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("idx_chat_session_baby_updated", "baby_id", "updated_at"),
    )
```

### 新規テーブル: `chat_messages`

```python
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)      # "user" または "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    __table_args__ = (
        Index("idx_chat_message_session_created", "session_id", "created_at"),
    )
```

### Alembic マイグレーション

```bash
alembic revision --autogenerate -m "add chat_sessions and chat_messages tables"
alembic upgrade head
```

---

## バックエンド設計

### 新規・変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `app/models/chatbot.py` | **新規作成** | `ChatSession`, `ChatMessage` モデル |
| `app/schemas/chatbot.py` | **新規作成** | Pydantic スキーマ |
| `app/routers/chatbot.py` | **新規作成** | チャット API エンドポイント |
| `app/services/chatbot.py` | **新規作成** | RAGコンテキスト生成・OpenAI 呼び出しロジック |
| `app/models/__init__.py` | **変更** | `ChatSession`, `ChatMessage` をインポートに追加 |
| `app/main.py` | **変更** | `chatbot` router を `include_router` |

---

### Pydantic スキーマ

```python
# app/schemas/chatbot.py

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ChatSessionCreate(BaseModel):
    """POST /sessions リクエストボディ: セッション作成 + 初回メッセージ"""
    first_message: str              # 初回のユーザーメッセージ


class ChatMessageCreate(BaseModel):
    """POST /sessions/{id}/messages リクエストボディ"""
    content: str                    # ユーザーメッセージ本文


class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    role: str                       # "user" | "assistant"
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    id: int
    baby_id: int
    user_id: Optional[int]
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatSessionDetailResponse(BaseModel):
    """セッション詳細 + メッセージ一覧"""
    id: int
    baby_id: int
    user_id: Optional[int]
    title: str
    messages: List[ChatMessageResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatSendResponse(BaseModel):
    """メッセージ送信後のレスポンス（ユーザーメッセージ + AIレスポンス）"""
    user_message: ChatMessageResponse
    assistant_message: ChatMessageResponse
```

---

### API エンドポイント

#### `POST /api/babies/{baby_id}/chat/sessions`

**概要**: チャットセッションを新規作成し、初回メッセージを送信してAI応答を返す。

**権限**: `verify_baby_access(db, baby_id, current_user.id)`

**リクエストボディ**:
```json
{ "first_message": "最近夜中に3回起きるのですが、これは多いですか？" }
```

**処理詳細**:
1. `verify_baby_access()` でアクセス検証。
2. `title` = `first_message` の先頭 50 文字（それ以降は「...」で省略）。
3. `ChatSession` を DB に作成。
4. ユーザーメッセージを `ChatMessage` として保存（`role="user"`）。
5. RAGコンテキストを生成（後述）。
6. OpenAI API (`gpt-4o-mini`) に送信（システムプロンプト + 会話履歴 + ユーザーメッセージ）。
7. AI 応答を `ChatMessage` として保存（`role="assistant"`）。
8. `ChatSendResponse` を返す。

**レスポンス** (`201 Created`):
```json
{
  "user_message": {
    "id": 1, "session_id": 10, "role": "user",
    "content": "最近夜中に3回起きるのですが...", "created_at": "..."
  },
  "assistant_message": {
    "id": 2, "session_id": 10, "role": "assistant",
    "content": "レンくんの直近7日間の睡眠記録を見ると...", "created_at": "..."
  }
}
```

**エラーレスポンス**:
- `400 Bad Request`: `first_message` が空
- `503 Service Unavailable`: OpenAI API 障害

---

#### `POST /api/babies/{baby_id}/chat/sessions/{session_id}/messages`

**概要**: 既存セッションにメッセージを追加しAI応答を返す。

**権限**: `verify_baby_access(db, baby_id, current_user.id)` + セッションの `baby_id` 一致確認

**リクエストボディ**:
```json
{ "content": "改善のためにできることはありますか？" }
```

**処理詳細**:
1. `verify_baby_access()` でアクセス検証。
2. `session_id` が `baby_id` に属することを確認（他の赤ちゃんのセッションを操作不可）。
3. ユーザーメッセージを `ChatMessage` として保存。
4. 直近 5 件の会話履歴を取得して LLM に渡す。
5. RAGコンテキストを生成（システムプロンプト再構築）。
6. OpenAI API を呼び出し。
7. AI 応答を `ChatMessage` として保存。
8. `ChatSession.updated_at` を更新。
9. `ChatSendResponse` を返す。

**エラーレスポンス**:
- `400 Bad Request`: `content` が空
- `404 Not Found`: `session_id` が存在しない・`baby_id` に属していない
- `503 Service Unavailable`: OpenAI API 障害

---

#### `GET /api/babies/{baby_id}/chat/sessions`

**概要**: セッション一覧を取得（直近 20 件、`updated_at` 降順）。

**権限**: `verify_baby_access(db, baby_id, current_user.id)`

**クエリパラメータ** (optional):
- `limit`: 取得件数（デフォルト 20、最大 50）
- `offset`: スキップ件数（デフォルト 0）

**レスポンス** (`200 OK`): `List[ChatSessionResponse]`

---

#### `GET /api/babies/{baby_id}/chat/sessions/{session_id}`

**概要**: セッション詳細とメッセージ一覧を取得。

**権限**: `verify_baby_access(db, baby_id, current_user.id)` + セッションの `baby_id` 一致確認

**レスポンス** (`200 OK`): `ChatSessionDetailResponse`（全メッセージを `created_at` 昇順で返す）

---

#### `DELETE /api/babies/{baby_id}/chat/sessions/{session_id}`

**概要**: セッションとその全メッセージを削除。

**権限**:
- セッションの作成者（`user_id` が一致）、または
- `admin` ロールのユーザー

**処理詳細**:
1. `verify_baby_access()` でアクセス検証。
2. セッションの `user_id == current_user.id` または `family_user.role == "admin"` を確認。
3. `CASCADE` 設定により `ChatMessage` も自動削除。

**レスポンス** (`200 OK`):
```json
{ "message": "Deleted" }
```

**エラーレスポンス**:
- `403 Forbidden`: 作成者でも admin でもないユーザーが削除しようとした
- `404 Not Found`: セッションが存在しない

---

### RAGコンテキスト設計

```python
# app/services/chatbot.py

import os
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from openai import OpenAI, APIError

from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.chatbot import ChatMessage


SYSTEM_PROMPT_TEMPLATE = """あなたは育児をサポートする専門的なアシスタントです。

【重要な免責事項】
- あなたは医療の専門家ではありません。診断、処方、医学的判断は行いません。
- 体調不良、発熱、ケガなど医療的懸念がある場合は、かかりつけ医への受診を促してください。
- 回答は参考情報として提供します。最終的な判断は保護者と医療従事者が行うべきです。

【赤ちゃんについて】
赤ちゃんの名前: {baby_name}
生年月日: {birth_date}

【直近7日間の育児記録サマリー】
{record_summary}

上記の記録を参考にしながら、親身になって相談に答えてください。
医療的な懸念が含まれる質問には、適切な受診の目安を提示してください。
"""


def build_rag_context(db: Session, baby_id: int, baby_name: str, birth_date: str) -> str:
    """直近7日分の記録を集計してRAGコンテキスト文字列を生成する。"""
    today = date.today()
    week_ago = datetime.combine(today - timedelta(days=7), datetime.min.time())
    now = datetime.combine(today, datetime.max.time())

    # 授乳
    feedings = db.query(Feeding).filter(
        Feeding.baby_id == baby_id,
        Feeding.feeding_time >= week_ago,
        Feeding.feeding_time <= now,
    ).all()
    feeding_count = len(feedings)
    avg_feeding_per_day = round(feeding_count / 7, 1)

    # 睡眠
    sleeps = db.query(Sleep).filter(
        Sleep.baby_id == baby_id,
        Sleep.start_time >= week_ago,
        Sleep.start_time <= now,
    ).all()
    total_sleep_min = sum(
        int((s.end_time - s.start_time).total_seconds() / 60)
        for s in sleeps if s.end_time
    )
    avg_sleep_min_per_day = round(total_sleep_min / 7)

    # おむつ
    diapers = db.query(Diaper).filter(
        Diaper.baby_id == baby_id,
        Diaper.diaper_time >= week_ago,
        Diaper.diaper_time <= now,
    ).all()
    avg_diaper_per_day = round(len(diapers) / 7, 1)

    # 成長（最新1件）
    latest_growth = db.query(Growth).filter(
        Growth.baby_id == baby_id,
    ).order_by(Growth.recorded_at.desc()).first()

    lines = [
        f"・授乳: 7日間合計{feeding_count}回（1日平均{avg_feeding_per_day}回）",
        f"・睡眠: 1日平均{avg_sleep_min_per_day}分（{round(avg_sleep_min_per_day/60, 1)}時間）",
        f"・おむつ: 7日間合計{len(diapers)}回（1日平均{avg_diaper_per_day}回）",
    ]
    if latest_growth:
        growth_parts = []
        if latest_growth.weight_kg:
            growth_parts.append(f"体重 {latest_growth.weight_kg}kg")
        if latest_growth.height_cm:
            growth_parts.append(f"身長 {latest_growth.height_cm}cm")
        if growth_parts:
            lines.append(f"・最新成長記録: {'、'.join(growth_parts)}")

    return "\n".join(lines)


def build_messages_for_llm(
    db: Session,
    session_id: int,
    new_user_content: str,
    baby_name: str,
    birth_date: str,
    rag_context: str,
) -> list:
    """LLMに渡すメッセージリストを構築する（システムプロンプト + 直近5件履歴 + 新規メッセージ）。"""
    system_content = SYSTEM_PROMPT_TEMPLATE.format(
        baby_name=baby_name,
        birth_date=birth_date,
        record_summary=rag_context,
    )

    # 直近5件の履歴（新規メッセージを除く）
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(5)
        .all()
    )
    history.reverse()  # 時系列順に並び替え

    messages = [{"role": "system", "content": system_content}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": new_user_content})

    return messages


def call_openai_chat(messages: list, model_name: str = "gpt-4o-mini") -> str:
    """OpenAI API を呼び出してアシスタント応答テキストを返す。失敗時は APIError を raise する。"""
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            max_tokens=800,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except APIError as e:
        raise e
```

---

### `app/main.py` への router 登録

```python
from app.routers import chatbot
app.include_router(chatbot.router)
```

---

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API キー（AI日誌生成と共用） | ✅ |

---

## フロントエンド設計

### 新規・変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `frontend/hooks/useChatbot.ts` | **新規作成** | SWR フック + API ミューテーション関数 |
| `frontend/app/(dashboard)/[babyId]/chat/page.tsx` | **新規作成** | セッション一覧ページ |
| `frontend/app/(dashboard)/[babyId]/chat/[sessionId]/page.tsx` | **新規作成** | チャット画面 |
| `frontend/components/chat/ChatBubble.tsx` | **新規作成** | メッセージバブルコンポーネント |
| `frontend/components/chat/ChatInput.tsx` | **新規作成** | メッセージ入力フォーム |
| `frontend/components/chat/MedicalDisclaimerBanner.tsx` | **新規作成** | 免責バナー（常時固定表示） |

---

### `useChatbot.ts`

```typescript
// frontend/hooks/useChatbot.ts

import useSWR from "swr";
import { fetcher } from "@/lib/api";

export type ChatMessage = {
  id: number;
  session_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type ChatSession = {
  id: number;
  baby_id: number;
  user_id: number | null;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatSessionDetail = ChatSession & {
  messages: ChatMessage[];
};

export type ChatSendResponse = {
  user_message: ChatMessage;
  assistant_message: ChatMessage;
};

/** セッション一覧取得 */
export function useChatSessions(babyId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<ChatSession[]>(
    babyId ? `/babies/${babyId}/chat/sessions` : null,
    fetcher
  );
  return { sessions: data, isLoading, isError: error, mutate };
}

/** セッション詳細 + メッセージ一覧取得 */
export function useChatSession(babyId: number | null, sessionId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<ChatSessionDetail>(
    babyId && sessionId ? `/babies/${babyId}/chat/sessions/${sessionId}` : null,
    fetcher
  );
  return { session: data, isLoading, isError: error, mutate };
}

/** セッション作成 + 初回メッセージ送信 */
export async function createChatSession(
  babyId: number,
  firstMessage: string
): Promise<{ sessionId: number; response: ChatSendResponse }> {
  const res = await fetch(`/api/babies/${babyId}/chat/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ first_message: firstMessage }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "チャットの開始に失敗しました");
  }
  const data: ChatSendResponse = await res.json();
  return { sessionId: data.user_message.session_id, response: data };
}

/** メッセージ送信 */
export async function sendChatMessage(
  babyId: number,
  sessionId: number,
  content: string
): Promise<ChatSendResponse> {
  const res = await fetch(`/api/babies/${babyId}/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "メッセージの送信に失敗しました");
  }
  return res.json();
}

/** セッション削除 */
export async function deleteChatSession(
  babyId: number,
  sessionId: number
): Promise<void> {
  const res = await fetch(`/api/babies/${babyId}/chat/sessions/${sessionId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "セッションの削除に失敗しました");
  }
}

/** 受診推奨キーワードを含むかチェック */
export function containsMedicalAlert(content: string): boolean {
  const ALERT_KEYWORDS = [
    "受診をおすすめ",
    "受診してください",
    "病院に",
    "かかりつけ医",
    "救急",
    "診察",
  ];
  return ALERT_KEYWORDS.some((kw) => content.includes(kw));
}
```

---

### 画面構成

#### セッション一覧ページ (`/[babyId]/chat`)

```
┌─────────────────────────────────────────┐
│ ← 戻る    育児相談                      │  ← sticky header
└─────────────────────────────────────────┘

  [新しい相談を始める]  ← 常に表示

  ┌───────────────────────────────────────┐
  │ 💬 夜中に3回起きるのですが...         │
  │ 2026-02-14 15:30                  🗑️  │
  └───────────────────────────────────────┘

  ┌───────────────────────────────────────┐
  │ 💬 離乳食の量について教えてください    │
  │ 2026-02-10 09:15                  🗑️  │
  └───────────────────────────────────────┘
```

#### チャット画面 (`/[babyId]/chat/[sessionId]`)

```
┌─────────────────────────────────────────┐
│ ← 戻る    夜中に3回起きるのですが...    │  ← sticky header
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⚠️ このAIは医療行為を行いません。        │  ← 免責バナー（常時固定）
│ 体調不良は必ずかかりつけ医にご相談ください │
└─────────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │        最近夜中に3回起きるのですが、  │  ← ユーザーバブル（右寄せ）
  │        これは多いですか？             │
  └──────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │ レンくんの直近7日間の睡眠記録を見ると │  ← AIバブル（左寄せ）
  │ 1日平均12時間の睡眠が取れています。   │
  │ 夜中3回の覚醒は月齢的に...           │
  └──────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │ 🔴 発熱や著しい体調不良がある場合は  │  ← 医療アラートバブル（強調表示）
  │ 受診をおすすめします。               │
  └──────────────────────────────────────┘

─────────────────────────────────────────
  ┌─────────────────────────────────┐ [送信]  ← 入力フォーム（画面下部固定）
  │ メッセージを入力...              │
  └─────────────────────────────────┘
```

---

### `MedicalDisclaimerBanner.tsx`

```tsx
// frontend/components/chat/MedicalDisclaimerBanner.tsx

export function MedicalDisclaimerBanner() {
  return (
    <div className="sticky top-14 z-10 bg-amber-50 border-b border-amber-200 px-4 py-2">
      <p className="text-xs text-amber-700 text-center">
        ⚠️ このAIは医療診断を行いません。体調不良や緊急時はかかりつけ医にご相談ください。
      </p>
    </div>
  );
}
```

---

### `ChatBubble.tsx`

```tsx
// frontend/components/chat/ChatBubble.tsx

import { containsMedicalAlert } from "@/hooks/useChatbot";

type Props = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export function ChatBubble({ role, content, createdAt }: Props) {
  const isUser = role === "user";
  const hasMedicalAlert = !isUser && containsMedicalAlert(content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={[
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-violet-500 text-white rounded-br-sm"
            : hasMedicalAlert
            ? "bg-red-50 border border-red-200 text-red-800 rounded-bl-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm",
        ].join(" ")}
      >
        {hasMedicalAlert && (
          <p className="font-semibold text-red-600 mb-1">🔴 受診のご案内</p>
        )}
        <p className="whitespace-pre-wrap">{content}</p>
        <p className="text-xs opacity-60 mt-1 text-right">
          {new Date(createdAt).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
```

---

### `ChatInput.tsx`

```tsx
// frontend/components/chat/ChatInput.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

type Props = {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);
    try {
      await onSend(input.trim());
      setInput("");
    } finally {
      setIsSending(false);
    }
  };

  // Enterキー（Shift+Enterで改行）で送信
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="メッセージを入力... (Shift+Enterで改行)"
        rows={1}
        className="resize-none flex-1"
        disabled={disabled || isSending}
      />
      <Button
        onClick={handleSubmit}
        disabled={disabled || isSending || !input.trim()}
        size="icon"
        className="bg-violet-500 hover:bg-violet-600 shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

---

## 権限制御

| 操作 | admin | member（許可） | member（制限） |
|------|-------|--------------|--------------|
| セッション一覧取得 | ✅ | ✅ | `baby` レベル制限時 403 |
| セッション作成+送信 | ✅ | ✅ | `baby` レベル制限時 403 |
| メッセージ送信 | ✅ | ✅ | `baby` レベル制限時 403 |
| セッション詳細取得 | ✅ | ✅ | `baby` レベル制限時 403 |
| セッション削除 | ✅（admin免除） | ✅（自分のセッションのみ） | ❌（他者のセッション） |

> チャット操作は `record_type` 単位の権限制御対象外（`baby` レベルのみ検証）。

---

## エラーハンドリング

| エラー条件 | バックエンド | フロントエンド |
|-----------|------------|--------------|
| OpenAI API 障害 | `503 Service Unavailable` | トースト「AIサービスが一時的に利用できません」+ 入力フォームを再度有効化 |
| 空メッセージ送信 | `400 Bad Request` | 送信ボタン disabled（フロント側で事前ガード） |
| 自分のセッション以外を削除 | `403 Forbidden` | トースト「このセッションは削除できません」 |
| 存在しないセッション | `404 Not Found` | トースト「セッションが見つかりません」 |
| 送信中の二重送信 | — | `isSending=true` 中はボタン disabled（フロント側で防止） |
| 未認証 | `401 Unauthorized` | リダイレクト（既存の認証ガード） |
| アクセス権限なし | `403 Forbidden` | トースト「アクセス権限がありません」 |

---

## 実装チェックリスト

### バックエンド

- [ ] `app/models/chatbot.py` 作成（`ChatSession`, `ChatMessage` モデル）
- [ ] `app/models/__init__.py` に `ChatSession`, `ChatMessage` インポート追加
- [ ] `alembic revision --autogenerate -m "add chat_sessions and chat_messages tables"` 実行
- [ ] マイグレーション内容確認（2テーブル新規作成のみ）
- [ ] `alembic upgrade head` でマイグレーション適用
- [ ] `app/schemas/chatbot.py` 作成（上記スキーマ定義）
- [ ] `app/services/chatbot.py` 作成
  - [ ] `build_rag_context()` 実装（直近7日分の記録集計）
  - [ ] `build_messages_for_llm()` 実装（システムプロンプト + 直近5件履歴）
  - [ ] `call_openai_chat()` 実装（OpenAI 呼び出し、`APIError` を raise）
- [ ] `app/routers/chatbot.py` 作成
  - [ ] `POST /api/babies/{baby_id}/chat/sessions` 実装
  - [ ] `POST /api/babies/{baby_id}/chat/sessions/{session_id}/messages` 実装
  - [ ] `GET  /api/babies/{baby_id}/chat/sessions` 実装（直近20件）
  - [ ] `GET  /api/babies/{baby_id}/chat/sessions/{session_id}` 実装
  - [ ] `DELETE /api/babies/{baby_id}/chat/sessions/{session_id}` 実装（作成者 or admin のみ）
  - [ ] 全エンドポイントで `verify_baby_access()` 呼び出しを確認
  - [ ] セッションの `baby_id` 一致チェックを確認
  - [ ] OpenAI `APIError` を 503 に変換するエラーハンドラを確認
- [ ] `app/main.py` に `chatbot` router を登録
- [ ] `.env` に `OPENAI_API_KEY` を設定（AI日誌と共用）

### フロントエンド

- [ ] `frontend/hooks/useChatbot.ts` 作成
  - [ ] `useChatSessions()` SWR フック
  - [ ] `useChatSession()` SWR フック
  - [ ] `createChatSession()` 関数
  - [ ] `sendChatMessage()` 関数
  - [ ] `deleteChatSession()` 関数
  - [ ] `containsMedicalAlert()` ユーティリティ関数
- [ ] `frontend/components/chat/MedicalDisclaimerBanner.tsx` 作成（免責バナー）
- [ ] `frontend/components/chat/ChatBubble.tsx` 作成
  - [ ] ユーザー/アシスタントで色分け
  - [ ] 受診推奨キーワード検出時のハイライト表示
- [ ] `frontend/components/chat/ChatInput.tsx` 作成
  - [ ] 送信中（`isSending=true`）はボタン disabled（二重送信防止）
  - [ ] Shift+Enter で改行、Enter で送信
- [ ] `frontend/app/(dashboard)/[babyId]/chat/page.tsx` 作成
  - [ ] `useChatSessions()` でデータ取得
  - [ ] 「新しい相談を始める」ボタン
  - [ ] セッション一覧（タイトル + 最終更新日時）
  - [ ] 削除確認ダイアログ
- [ ] `frontend/app/(dashboard)/[babyId]/chat/[sessionId]/page.tsx` 作成
  - [ ] `useChatSession()` でデータ取得
  - [ ] `MedicalDisclaimerBanner` を最上部に常時固定表示
  - [ ] `ChatBubble` でメッセージ一覧表示
  - [ ] `ChatInput` を画面下部に固定
  - [ ] AI応答待ち中は入力フォームを disabled + スピナー表示
  - [ ] 新規メッセージ送信後に最下部へ自動スクロール
  - [ ] `mutate()` でメッセージ一覧を更新
- [ ] `cd frontend && pnpm build` でビルド確認

---

## 参照先ドキュメント

- `.specify/specs/settings/baby_permissions.md` — `verify_baby_access()` の仕様
- `.specify/specs/ai/ai_daily_summary.md` — AI日誌生成仕様（`OPENAI_API_KEY` 共用）
- `.specify/specs/ui/ui_design_system.md` — カラーパレット・コンポーネントデザイン
- `app/models/feeding.py` — `Feeding` モデル
- `app/models/sleep.py` — `Sleep` モデル
- `app/models/diaper.py` — `Diaper` モデル
- `app/models/growth.py` — `Growth` モデル
- `app/dependencies.py` — `verify_baby_access()` 実装
- `frontend/hooks/useData.ts` — SWR フックのパターン参照
- `frontend/hooks/useBabyPermissions.ts` — ミューテーション関数のパターン参照
