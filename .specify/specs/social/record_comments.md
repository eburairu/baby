# 記録へのコメント機能 仕様書 (Comments on Records Specification)

## 概要

授乳、睡眠、おむつなどの各育児記録に対して、家族メンバーがコメント（応援メッセージ）を残せる機能。
「遠方の両親（viewer）も育児に参加している体験」を提供し、育児の励みになるメッセージを共有することを目的とする。

---

## 背景・目的

- 育児記録は単なるログになりがちだが、そこに家族からの「お疲れ様！」「よく飲んだね」といったメッセージが加わることで、双方向のコミュニケーションを生む。
- viewer ロール（祖父母など）が、単に閲覧するだけでなく、積極的な応援という形で育児に参加できるようにする。

---

## 用語定義

| 用語 | 定義 |
|------|------|
| `record_type` | コメント対象の記録の種類（`feeding`, `sleep`, `diaper`, `growth`, `contraction`, `schedule`, `note`） |
| `record_id` | 各記録テーブルにおけるプライマリキー ID |
| `応援メッセージ` | 本機能で投稿されるコメントの呼称。ポジティブなコミュニケーションを促進する |

---

## データベース設計

### `RecordComment` モデル

新規テーブル `record_comments` を作成する。

| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| `id` | Integer | Primary Key, autoincrement | コメント ID |
| `baby_id` | Integer | ForeignKey("babies.id"), nullable=False | フィルタリング用の赤ちゃん ID |
| `user_id` | Integer | ForeignKey("users.id"), nullable=False | 投稿者 ID |
| `record_type` | String | nullable=False | 記録の種類（`feeding` 等） |
| `record_id` | Integer | nullable=False | 対象記録の ID |
| `content` | String | nullable=False | コメント内容 |
| `created_at` | DateTime | nullable=False, default=now() | 投稿日時 |

**注意**: 本モデルはポリモーフィックな関連（複数のテーブルを横断して参照）であるため、`record_id` に対して DB レベルの外部キー制約を貼ることができない。

**インデックス**:
- `(record_type, record_id)`: 特定の記録に対するコメントを高速に取得するため。
- `baby_id`: 赤ちゃんごとのコメント一覧を取得する場合のため。

---

## バックエンド設計

### Pydantic スキーマ

```python
# app/schemas/comment.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    user_id: int
    user_display_name: Optional[str]
    user_role: str  # "admin", "member", "viewer" (フロントエンドでの強調表示用)
    created_at: datetime

    class Config:
        from_attributes = True
```

### 既存スキーマの拡張

`app/routers/baby.py` 内の `UnifiedRecord` スキーマに `comment_count` を追加する。

```python
class UnifiedRecord(BaseModel):
    id: int
    type: str
    timestamp: datetime
    details: dict
    comment_count: int = 0  # 追加
```

### API エンドポイント

#### `GET /api/records/{record_type}/{record_id}/comments`
**概要**: 特定の記録に紐づくコメント一覧を取得する。
**権限**: 対象の赤ちゃん・記録タイプに対する閲覧権限（`verify_baby_access` でチェック）。
**レスポンス**: `List[CommentResponse]`

#### `POST /api/records/{record_type}/{record_id}/comments`
**概要**: 記録にコメントを投稿する。
**権限**: 
- 対象の赤ちゃん・記録タイプに対する閲覧権限があること。
- **特例**: 通常 `viewer` は `require_write=True` で拒否されるが、コメント投稿に限っては `VIEWER` ロールも許可する。
**バリデーション**:
- バックエンド側で `{record_type}` と `{record_id}` から対象記録が実在することを確認し、その記録から `baby_id` を自動取得して保存する。
**リクエストボディ**: `CommentCreate`

#### `DELETE /api/comments/{comment_id}`
**概要**: コメントを削除する。
**権限**: 自分のコメント、または `admin` ロール。

---

## フロントエンド設計

### UI デザイン方針

- **記録一覧（タイムライン）**:
  - 各記録カードにコメントアイコンと件数を表示。
  - アイコンクリック、またはカード詳細展開時にコメントリストを表示。
- **コメント表示**:
  - 投稿者の表示名、投稿時間、内容を表示。
  - viewer からのメッセージは少し強調（例：色を変える、ラベルをつける）して、応援メッセージであることを際立たせる。
- **投稿インターフェース**:
  - 簡潔なテキスト入力欄と送信ボタン。
  - 「応援を送る」といったラベルを使用。

### コンポーネント構成

- `frontend/components/records/CommentSection.tsx`: コメント一覧と入力欄をまとめたコンポーネント。
- `frontend/components/records/CommentItem.tsx`: 個別のコメント表示。
- `frontend/hooks/useComments.ts`: コメント取得・投稿用の SWR / Mutation フック。

---

## 権限・アクセス制御

| ロール | 記録の作成/編集 | 記録の閲覧 | コメントの投稿 | コメントの削除 |
|-------|--------------|-----------|--------------|--------------|
| admin | ✅ | ✅ | ✅ | ✅（全員分） |
| member| ✅ | ✅* | ✅* | ✅（自分のみ） |
| viewer| ❌ | ✅* | ✅* | ✅（自分のみ） |

`*` は `BabyPermission` の設定に従う。記録自体が見えない場合はコメントも閲覧・投稿不可。

---

## 実装計画

### Step 1: バックエンド基盤
1. `app/models/comment.py` の作成。
2. `alembic` によるマイグレーション（`record_comments` テーブル作成）。
3. `app/schemas/comment.py` の作成。
4. `app/routers/comments.py` の作成と `app/main.py` への登録。

### Step 2: 既存 API の拡張
1. `app/routers/baby.py` の `UnifiedRecord` に `comment_count` を追加。
2. `get_records` エンドポイントで、各記録に紐づくコメント数を取得して結合するロジックを追加。

### Step 3: 各記録への統合と整合性維持
1. 記録削除処理（`app/routers/baby.py` の `delete_baby` や各記録の削除 API）において、紐づくコメントを明示的に削除する `db.query(RecordComment).filter(...) .delete()` を実行する。

### Step 4: フロントエンド実装
1. `useComments` フックの実装。
2. `CommentItem`, `CommentSection` コンポーネントの作成。
3. タイムラインへの統合。

---

## 動作確認タスク

### 自動テスト (pytest)
- [ ] 閲覧権限があるユーザーがコメントを投稿できること。
- [ ] `viewer` ロールのユーザーがコメントを投稿できること。
- [ ] 閲覧権限がない記録に対してコメントを取得・投稿しようとすると 403 エラーになること。
- [ ] 他人のコメントを削除できないこと（admin を除く）。
- [ ] 記録を削除した際、関連するコメントが消えること。

### 手動確認
- [ ] スマホ画面でコメント入力がスムーズに行えるか。
- [ ] viewer（祖父母役のアカウント）でログインし、応援メッセージが投稿できるか。
- [ ] 投稿したコメントが即座に画面に反映されるか（SWR の mutate）。

---

## 将来の拡張性（任意）

- **通知**: コメントがついた際に、admin/member にプッシュ通知やメールで知らせる機能。
- **リアクション**: メッセージに対してスタンプや「いいね」で反応する機能。
- **画像付きコメント**: お祝いの画像などを添えられるようにする。
