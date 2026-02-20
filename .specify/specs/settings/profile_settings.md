# プロフィール編集機能 仕様書 (Profile Settings Specification)

## 概要

ログイン中のユーザーが自身の表示名（`display_name`）を設定・編集できる機能。
`username` はログイン ID として維持し、`display_name` をアプリ内の表示に使用する。

設定エントリポイントは `/settings` ページのメニューに「プロフィール」項目として追加する。

---

## 背景・現状の課題

- `User` モデルには `username`（ログイン ID）しかなく、表示名を自由に設定できない。
- ダッシュボードレイアウト（`frontend/app/(dashboard)/layout.tsx`）で `Welcome, {user.username}` と表示しているが、ログイン ID がそのまま見えている。
- 家族設定のメンバー一覧（`MemberList.tsx`）でも `member.username` をそのまま表示している。

---

## 用語定義

| 用語 | 定義 |
|------|------|
| `username` | ログイン ID。変更不可。システム内での一意識別子 |
| `display_name` | ユーザーが自由に設定できる表示名。nullable。未設定時は `username` にフォールバック |
| 表示名 | `display_name` が設定されている場合はその値、未設定の場合は `username` |

---

## 機能要件

### PF1: プロフィール表示

- `/settings/profile` ページで現在のプロフィール情報を表示する。
- 表示情報:
    - 表示名（`display_name` または `username`）
    - ユーザー名（`username`、ログイン ID として参考表示）

### PF2: 表示名の編集

- 「表示名を編集」ボタンをタップするとダイアログが開く（ページ遷移なし）。
- 入力フィールドに現在の `display_name`（未設定なら空欄）を初期値として表示する。
- バリデーション:
    - 最大 50 文字
    - 空文字を送信した場合 = `display_name` をクリア（`null` に設定、`username` にフォールバック）
- 保存後: ダイアログを閉じ、成功トーストを表示。表示を即時更新する。

### PF3: パスワードの変更

- 「パスワードを変更」ボタンをタップするとダイアログが開く。
- 入力フィールド:
    - 現在のパスワード（入力必須。不正なパスワードでの変更を防ぐため）
    - 新しいパスワード（8文字以上）
    - 新しいパスワード（確認用、新しいパスワードと一致することを確認）
- バリデーション:
    - 現在のパスワードが正しくない場合は 400 を返す
    - 新しいパスワードが 8 文字未満の場合はエラー
    - 確認用パスワードが一致しない場合はフロントエンドで弾く（zod）
- 保存後: ダイアログを閉じ、成功トーストを表示する。
- **admin からパスワード再発行を受けた場合**: 仮パスワードでログイン後、このダイアログで本パスワードに変更する。

#### エンドポイント

`POST /api/auth/change-password`

```python
class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
```

- `current_password` を bcrypt で照合し、不一致なら `400 Bad Request`。
- 一致した場合のみ `new_password` をハッシュ化して `User.hashed_password` を更新する。

#### 画面構成（変更ダイアログ）

```
┌─────────────────────────────────────┐
│  パスワードを変更                    │
│  ─────────────────────────────────  │
│  現在のパスワード                    │
│  ┌───────────────────────────────┐  │
│  │ ••••••••                     │  │
│  └───────────────────────────────┘  │
│  新しいパスワード（8文字以上）       │
│  ┌───────────────────────────────┐  │
│  │ ••••••••                     │  │
│  └───────────────────────────────┘  │
│  新しいパスワード（確認）            │
│  ┌───────────────────────────────┐  │
│  │ ••••••••                     │  │
│  └───────────────────────────────┘  │
│                                     │
│              [キャンセル] [変更する] │
└─────────────────────────────────────┘
```

### PF4: 表示名のアプリ全体への反映

表示名（`display_name ?? username`）を使用するすべての場所を更新する。

| 場所 | ファイル | 現在 | 変更後 |
|------|---------|------|--------|
| ダッシュボードヘッダー | `app/(dashboard)/layout.tsx` | `user.username` | `user.display_name ?? user.username` |
| 家族設定のメンバー一覧 | `components/settings/MemberList.tsx` | `member.username` | `member.display_name ?? member.username` |

---

## データベース設計

### `users` テーブルへのカラム追加

```sql
ALTER TABLE users ADD COLUMN display_name VARCHAR NULL;
```

- 型: `VARCHAR`（可変長文字列）
- nullable: `true`（未設定はアリ）
- デフォルト値: `NULL`

### Alembic マイグレーション

新規マイグレーションファイルを作成する:

```bash
alembic revision --autogenerate -m "add display_name to users"
```

生成されるマイグレーション内容（参考）:

```python
def upgrade() -> None:
    op.add_column('users', sa.Column('display_name', sa.String(), nullable=True))

def downgrade() -> None:
    op.drop_column('users', 'display_name')
```

---

## バックエンド設計

### 新規・変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `app/models/user.py` | **変更** | `display_name` カラム追加 |
| `app/schemas/user.py` | **変更** | `UserResponse`, `UserProfileUpdate` を更新・追加 |
| `app/schemas/family.py` | **変更** | `FamilyMemberResponse` に `display_name` を追加 |
| `app/routers/auth.py` | **変更** | `PATCH /api/auth/me` エンドポイント追加 |
| `alembic/versions/xxxx_add_display_name_to_users.py` | **新規作成** | マイグレーション |

---

### `app/models/user.py` の変更

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    display_name = Column(String, nullable=True)   # ← 追加
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    family_users = relationship("FamilyUser", back_populates="user")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
```

---

### `app/schemas/user.py` の変更

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    password: str


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=50)
    # display_name=None → null にクリア
    # display_name="" → null にクリア（バックエンドで空文字を null に変換する）


class UserResponse(BaseModel):
    id: int
    username: str
    display_name: Optional[str] = None   # ← 追加
    created_at: datetime

    class Config:
        from_attributes = True
```

---

### `app/schemas/family.py` の変更

```python
class FamilyMemberResponse(BaseModel):
    user_id: int
    username: str
    display_name: Optional[str] = None   # ← 追加
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True
```

`FamilyMemberResponse` は `FamilyUser` と `User` の JOIN で組み立てるため、`app/routers/family.py` 内の `GET /api/family/members` エンドポイントも合わせて更新が必要（後述）。

---

### `app/routers/auth.py` の変更

#### `PATCH /api/auth/me` エンドポイント追加

```python
from app.schemas.user import UserCreate, UserResponse, UserProfileUpdate

@router.patch("/me", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 空文字は null として扱う
    new_display_name = profile_in.display_name
    if new_display_name is not None and new_display_name.strip() == "":
        new_display_name = None

    current_user.display_name = new_display_name
    db.commit()
    db.refresh(current_user)
    return current_user
```

#### `GET /api/auth/me` のレスポンス

変更不要。`UserResponse` に `display_name` が追加されるため自動的に含まれる。

---

### `app/routers/family.py` の変更

`GET /api/family/members` で `FamilyMemberResponse` を組み立てる箇所に `display_name` を追加する。

現状の実装を確認し、`User.display_name` を取得して `FamilyMemberResponse` に含めるよう修正する。

```python
# 変更例（既存の実装に合わせて調整すること）
members = []
for fu in family_users:
    user = db.query(User).filter(User.id == fu.user_id).first()
    members.append(FamilyMemberResponse(
        user_id=fu.user_id,
        username=user.username,
        display_name=user.display_name,   # ← 追加
        role=fu.role,
        joined_at=fu.joined_at,
    ))
```

---

### エラーハンドリング

| エラー条件 | バックエンド | フロントエンド |
|-----------|------------|--------------|
| `display_name` が 50 文字超 | `422 Unprocessable Entity` | zod バリデーションで事前に弾く |
| 未認証でアクセス | `401 Unauthorized` | リダイレクト（既存の認証ガード） |

---

## フロントエンド設計

### 新規・変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `frontend/lib/types.ts` | **変更** | `User` 型に `display_name` を追加 |
| `frontend/lib/utils.ts`（または同等のユーティリティ） | **変更** | `getDisplayName()` ヘルパー関数を追加 |
| `frontend/app/(dashboard)/settings/profile/page.tsx` | **新規作成** | プロフィール設定ページ |
| `frontend/app/(dashboard)/settings/page.tsx` | **変更** | 設定メニューに「プロフィール」を追加 |
| `frontend/app/(dashboard)/layout.tsx` | **変更** | `user.username` → `getDisplayName(user)` |
| `frontend/components/settings/MemberList.tsx` | **変更** | `member.username` → `getDisplayName(member)` |

---

### `frontend/lib/types.ts` の変更

```typescript
export interface User {
    id: number;
    username: string;
    display_name: string | null;   // ← 追加
    created_at: string;
}
```

家族メンバーの型定義も合わせて更新（`MemberList.tsx` 内の `Member` インターフェース）:

```typescript
interface Member {
    user_id: number
    username: string
    display_name: string | null   // ← 追加
    role: string
    joined_at: string
}
```

---

### `getDisplayName()` ヘルパー関数

`display_name` と `username` のフォールバックロジックを一元化する。

```typescript
// frontend/lib/utils.ts に追加（または新規作成 frontend/lib/display.ts）

/**
 * ユーザーの表示名を返す。
 * display_name が設定されていれば display_name、なければ username にフォールバック。
 */
export function getDisplayName(user: { username: string; display_name?: string | null }): string {
    return user.display_name?.trim() || user.username;
}
```

---

### `/settings/profile` ページ

#### 画面構成

```
┌─────────────────────────────────────┐
│ ← 戻る    プロフィール              │  ← sticky header h-14
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  👤 プロフィール                     │
│  ─────────────────────────────────  │
│  表示名                             │
│  田中 太郎                   [編集]  │
│                                     │
│  ユーザー名（ログインID）            │
│  tanaka_taro                        │
│  ※ ユーザー名は変更できません        │
└─────────────────────────────────────┘
```

- `display_name` が未設定の場合、表示名欄には「未設定（{username} として表示中）」と グレー文字で表示する。
- 「編集」ボタンは全員（admin / member 共通）に表示する。
- `username` 欄は閲覧のみ（編集不可）。

#### 編集ダイアログ

```
┌─────────────────────────────────────┐
│  表示名を編集                        │
│  ─────────────────────────────────  │
│  表示名                             │
│  ┌───────────────────────────────┐  │
│  │ 田中 太郎                     │  │
│  └───────────────────────────────┘  │
│  ※ 空欄にするとユーザー名で表示されます │
│                                     │
│              [キャンセル] [保存]     │
└─────────────────────────────────────┘
```

#### フォームバリデーション（zod スキーマ）

```typescript
const profileSchema = z.object({
    display_name: z
        .string()
        .max(50, "表示名は50文字以内で入力してください")
        // 空文字は許可（= クリア扱い）
});
```

#### データ取得・更新

```typescript
// hooks/useAuth.ts の useUser() を再利用（既存）
const { user, mutate } = useUser();

// PATCH /api/auth/me
const handleSave = async (data: { display_name: string }) => {
    const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ display_name: data.display_name || null }),
    });
    if (!res.ok) throw new Error("更新に失敗しました");
    await mutate(); // SWR キャッシュを更新
};
```

---

### `/settings/page.tsx` の変更

プロフィール設定メニュー項目を追加する。

```typescript
import { Users, Baby, UserCircle } from "lucide-react"

const menuItems = [
    {
        href: "/settings/profile",
        icon: UserCircle,
        label: "プロフィール",
        description: "表示名の設定・変更",
        color: "text-sky-500",
        bg: "bg-sky-50",
    },
    {
        href: "/settings/family",
        icon: Users,
        label: "家族設定",
        description: "家族名・招待コード・メンバー管理",
        color: "text-violet-600",
        bg: "bg-violet-50",
    },
    {
        href: "/settings/babies",
        icon: Baby,
        label: "赤ちゃん管理",
        description: "赤ちゃんの情報追加・編集・削除",
        color: "text-pink-500",
        bg: "bg-pink-50",
    },
]
```

カテゴリーカラー: `sky`（プロフィール・個人設定を示す）

---

### `layout.tsx` の変更

```tsx
// 変更前
Welcome, {user.username}

// 変更後
Welcome, {getDisplayName(user)}
```

---

### `MemberList.tsx` の変更

```tsx
// 変更前（72行目付近）
<span className="font-medium text-gray-900">{member.username}</span>

// 変更後
<span className="font-medium text-gray-900">{getDisplayName(member)}</span>
```

削除確認ダイアログのタイトルも同様:

```tsx
// 変更前
<AlertDialogTitle>{deleteTarget?.username} を削除しますか？</AlertDialogTitle>

// 変更後
<AlertDialogTitle>{deleteTarget ? getDisplayName(deleteTarget) : ""} を削除しますか？</AlertDialogTitle>
```

---

## 権限制御

| 操作 | admin | member |
|------|-------|--------|
| 自分の表示名を閲覧 | ✅ | ✅ |
| 自分の表示名を編集 | ✅ | ✅ |
| 他者の表示名を編集 | ❌ | ❌ |
| 自分のパスワードを変更 | ✅ | ✅ |
| 他者のパスワードを変更 | ❌（家族設定のパスワード再発行を使う） | ❌ |

- 自分のプロフィールのみ編集可能（バックエンドは `current_user` から取得するため、他者の ID を直接指定するエンドポイントは存在しない）。

---

## API エンドポイントまとめ

| メソッド | エンドポイント | 実装状況 | 用途 |
|---------|--------------|---------|------|
| GET | `/api/auth/me` | ✅ 実装済み（`display_name` 追加済み） | 自身のプロフィール取得 |
| PATCH | `/api/auth/me` | ✅ 実装済み | 表示名の更新 |
| POST | `/api/auth/change-password` | ✅ 実装済み |  自分のパスワード変更 |
| GET | `/api/family/members` | ✅ 実装済み（`display_name` 追加済み） | メンバー一覧取得 |


---

## 実装チェックリスト

### バックエンド

- [x] `alembic revision --autogenerate -m "add display_name to users"` でマイグレーションファイル生成
- [x] マイグレーション内容確認（`display_name VARCHAR NULL` の追加のみであること）
- [x] `alembic upgrade head` でマイグレーション適用
- [x] `app/models/user.py` に `display_name` カラム追加
- [x] `app/schemas/user.py` に `UserProfileUpdate` スキーマ追加・`UserResponse` に `display_name` 追加
- [x] `app/schemas/family.py` の `FamilyMemberResponse` に `display_name` 追加
- [x] `app/routers/auth.py` に `PATCH /api/auth/me` エンドポイント追加
    - [x] 空文字を `null` に変換する処理
    - [x] 50文字制限の検証
- [x] `app/routers/auth.py` に `POST /api/auth/change-password` エンドポイント追加
    - [x] `current_password` を bcrypt で照合し、不一致なら 400
    - [x] `new_password` を bcrypt でハッシュ化して保存（8文字以上）
- [x] `app/schemas/user.py` に `PasswordChangeRequest` スキーマ追加
- [x] `app/routers/family.py` の `GET /api/family/members` レスポンスに `display_name` を含める

### フロントエンド

- [x] `frontend/lib/types.ts` の `User` 型に `display_name: string | null` を追加
- [x] `frontend/lib/utils.ts`（または同等ファイル）に `getDisplayName()` ヘルパー関数を追加
- [x] `frontend/app/(dashboard)/settings/profile/page.tsx` 新規作成
    - [x] プロフィール表示（表示名 + ユーザー名）
    - [x] 編集ダイアログ（`react-hook-form` + `zod`、shadcn `Dialog`）
    - [x] `PATCH /api/auth/me` 呼び出し後に `mutate()` で SWR キャッシュ更新
    - [x] 成功トースト表示
    - [x] 「パスワードを変更」ボタンを追加
    - [x] パスワード変更ダイアログ（現在のパスワード・新しいパスワード・確認用）
    - [x] `POST /api/auth/change-password` 呼び出し
    - [x] 成功・失敗トースト表示
- [x] `frontend/app/(dashboard)/settings/page.tsx` にプロフィールメニュー項目追加
- [x] `frontend/app/(dashboard)/layout.tsx` の `user.username` を `getDisplayName(user)` に置換
- [x] `frontend/components/settings/MemberList.tsx` の `member.username` を `getDisplayName(member)` に置換（ダイアログ内のタイトルも含む）
- [x] `MemberList` の `Member` インターフェースに `display_name: string | null` を追加
- [x] `cd frontend && pnpm build` でビルド確認

---

## 参照先ドキュメント

- `.specify/specs/settings/family_settings.md` — 家族設定・メンバー一覧
- `.specify/specs/ui/ui_design_system.md` — カラーパレット・コンポーネントデザイン
- `app/models/user.py` — `User` モデル
- `app/schemas/user.py` — `UserResponse` スキーマ
- `app/routers/auth.py` — 認証 API（`/api/auth/me`）
- `frontend/hooks/useAuth.ts` — `useUser()` SWR フック
- `frontend/app/(dashboard)/layout.tsx` — ダッシュボードレイアウト（username 表示箇所）
- `frontend/components/settings/MemberList.tsx` — メンバー一覧（username 表示箇所）
