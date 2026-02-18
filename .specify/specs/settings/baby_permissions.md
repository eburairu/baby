# 赤ちゃんアクセス権限設定 仕様書 (Baby Permission Settings Specification)

## 概要

家族のメンバー（`member` ロール）ごとに、各赤ちゃんの閲覧可否および記録タイプ別の閲覧可否を admin が制御できる機能。

設定画面は `/settings/babies` の各赤ちゃんカードに「アクセス権限」ボタンとして統合する。

---

## 背景・既存の状態

- `BabyPermission` テーブル（`app/models/baby.py`）はすでに DB に存在する。
  - フィールド: `id`, `baby_id`, `user_id`, `record_type`, `can_view`
  - ユニーク制約: `(baby_id, user_id, record_type)`
- しかし `verify_baby_access()`（`app/dependencies.py`）は `BabyPermission` を参照しておらず、ファミリー所属チェックのみ行っている。
- 各記録系エンドポイント（`/api/feedings/`, `/api/sleeps/` 等）も `BabyPermission` を参照していない。

本機能の実装により、既存の `BabyPermission` テーブルをフル活用する。

---

## 用語定義

| 用語 | 定義 |
|------|------|
| `record_type` | 権限制御の単位となる記録の種類。後述の有効値一覧を参照 |
| "baby" record_type | 赤ちゃん自体の可視性を制御する特殊な record_type |
| デフォルト許可 | `BabyPermission` レコードが存在しない場合、その操作は **許可** とみなす（既存動作を維持） |
| admin 免除 | `admin` ロールのユーザーは常にすべてにアクセス可能。権限制御の対象外 |

---

## 権限モデル設計

### 制御粒度

2段階の階層制御を採用する。

```
Baby（赤ちゃん全体の可視性）
  └── record_type 別（記録タイプ単位の可視性）
       ├── feeding（授乳）
       ├── sleep（睡眠）
       ├── diaper（おむつ）
       ├── growth（成長）
       ├── contraction（陣痛）
       ├── schedule（スケジュール）
       └── note（汎用メモ）
```

### `record_type` の有効値一覧

| 値 | 意味 | 対応テーブル |
|----|------|-------------|
| `"baby"` | 赤ちゃん自体（ダッシュボード上の選択・表示） | `babies` |
| `"feeding"` | 授乳記録 | `feedings` |
| `"sleep"` | 睡眠記録 | `sleeps` |
| `"diaper"` | おむつ記録 | `diapers` |
| `"growth"` | 成長記録 | `growth_records` |
| `"contraction"` | 陣痛記録 | `contractions` |
| `"schedule"` | スケジュール | `schedules` |
| `"note"` | 汎用メモ | `notes` |

### 権限判定ロジック

```
アクセス可否の判定（ユーザー U が赤ちゃん B の record_type R にアクセスする場合）:

1. U のロールが "admin" → アクセス許可（以降のチェックを省略）
2. BabyPermission に (baby_id=B, user_id=U, record_type="baby") のレコードが存在し can_view=false → アクセス拒否（赤ちゃん全体が非表示）
3. BabyPermission に (baby_id=B, user_id=U, record_type=R) のレコードが存在し can_view=false → アクセス拒否（当該記録タイプのみ非表示）
4. 上記いずれにも該当しない → アクセス許可（デフォルト許可）
```

### 既存動作との互換性

- `BabyPermission` レコードが存在しない場合 = すべて許可（現在の動作を維持）。
- 本機能の導入前後でユーザーの体験は変わらない（admin が明示的に設定した場合のみ制限される）。

---

## データベース設計

### 既存テーブル（変更なし）

```python
# app/models/baby.py（現状のまま）
class BabyPermission(Base):
    __tablename__ = "baby_permissions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    record_type = Column(String, nullable=False)
    can_view = Column(Boolean, nullable=False)

    __table_args__ = (
        UniqueConstraint("baby_id", "user_id", "record_type", name="uix_baby_user_record_type"),
    )
```

**スキーマ変更は不要**。Alembic マイグレーションも不要。

---

## バックエンド設計

### 新規ファイル

- `app/routers/baby_permissions.py` — 権限管理 API エンドポイント
- `app/schemas/baby_permission.py` — Pydantic スキーマ

### Pydantic スキーマ

```python
# app/schemas/baby_permission.py

from pydantic import BaseModel
from typing import List, Literal


VALID_RECORD_TYPES = Literal["baby", "feeding", "sleep", "diaper", "growth", "contraction", "schedule", "note"]


class BabyPermissionItem(BaseModel):
    """単一の権限レコード（1ユーザー × 1record_type）"""
    record_type: str
    can_view: bool


class UserPermissionSet(BaseModel):
    """1ユーザーに対するすべての record_type の権限セット"""
    user_id: int
    username: str
    permissions: List[BabyPermissionItem]


class BabyPermissionsResponse(BaseModel):
    """GET レスポンス: 赤ちゃん 1 体の全メンバー権限"""
    baby_id: int
    baby_name: str
    members: List[UserPermissionSet]


class BabyPermissionUpdate(BaseModel):
    """PUT リクエストボディ: 赤ちゃん 1 体の全権限を一括更新"""
    permissions: List[UserPermissionEntry]


class UserPermissionEntry(BaseModel):
    """PUT 用: 1ユーザー × 1record_type の更新エントリ"""
    user_id: int
    record_type: str  # 有効値は VALID_RECORD_TYPES
    can_view: bool
```

### API エンドポイント

#### `GET /api/babies/{baby_id}/permissions`

**概要**: 指定した赤ちゃんの全メンバーに対する権限一覧を返す。

**権限**: admin のみ

**レスポンス例**:
```json
{
  "baby_id": 1,
  "baby_name": "レンくん",
  "members": [
    {
      "user_id": 2,
      "username": "田中 花子",
      "permissions": [
        { "record_type": "baby",        "can_view": true  },
        { "record_type": "feeding",     "can_view": true  },
        { "record_type": "sleep",       "can_view": false },
        { "record_type": "diaper",      "can_view": true  },
        { "record_type": "growth",      "can_view": true  },
        { "record_type": "contraction", "can_view": true  },
        { "record_type": "schedule",    "can_view": true  }
      ]
    },
    {
      "user_id": 3,
      "username": "山田 次郎",
      "permissions": [
        { "record_type": "baby",        "can_view": false },
        ...
      ]
    }
  ]
}
```

**処理詳細**:
1. `verify_baby_access()` でアクセス検証（admin ロール確認を追加）。
2. 同一ファミリーの `member` ロールユーザー全員を `FamilyUser` から取得（自身 = admin は除外）。
3. 各ユーザーについて `BabyPermission` を検索し、7種類すべての `record_type` の `can_view` を組み立てる。
   - `BabyPermission` レコードが存在しない record_type は `can_view: true`（デフォルト許可）として返す。

---

#### `PUT /api/babies/{baby_id}/permissions`

**概要**: 指定した赤ちゃんの権限を一括更新する（upsert）。

**権限**: admin のみ

**リクエストボディ例**:
```json
{
  "permissions": [
    { "user_id": 2, "record_type": "sleep",       "can_view": false },
    { "user_id": 2, "record_type": "baby",        "can_view": true  },
    { "user_id": 3, "record_type": "baby",        "can_view": false }
  ]
}
```

**処理詳細**:
1. `verify_baby_access()` でアクセス検証（admin ロール確認を追加）。
2. リクエストの各エントリについて `record_type` の有効値チェック。
3. `user_id` が同一ファミリーの `member` ロールであることを確認（他ファミリーや admin への操作を拒否）。
4. 各エントリを `INSERT ... ON CONFLICT DO UPDATE`（upsert）で処理:
   ```python
   # SQLAlchemy での upsert
   existing = db.query(BabyPermission).filter(
       BabyPermission.baby_id == baby_id,
       BabyPermission.user_id == entry.user_id,
       BabyPermission.record_type == entry.record_type
   ).first()
   if existing:
       existing.can_view = entry.can_view
   else:
       db.add(BabyPermission(
           baby_id=baby_id,
           user_id=entry.user_id,
           record_type=entry.record_type,
           can_view=entry.can_view
       ))
   ```
5. `db.commit()` 後、更新後の権限一覧を `BabyPermissionsResponse` 形式で返す（GET と同じ形式）。

**エラーレスポンス**:
- `403 Forbidden`: admin 以外がアクセス
- `400 Bad Request`: 無効な `record_type`、または対象 `user_id` が同一ファミリーの member でない
- `404 Not Found`: 指定 `baby_id` が存在しない・アクセス不可

---

### `dependencies.py` の変更

#### `verify_baby_access()` の拡張

既存の `verify_baby_access()` を拡張し、`record_type` 引数を追加する。

```python
def verify_baby_access(
    db: Session,
    baby_id: int,
    user_id: int,
    record_type: str = "baby"
) -> Baby:
    """
    baby_id がユーザーのファミリーに属するか検証し、
    BabyPermission による閲覧制限もチェックする。
    失敗時 403 を raise。
    """
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    if not family_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")

    baby = db.query(Baby).filter(
        Baby.id == baby_id,
        Baby.family_id == family_user.family_id,
    ).first()
    if not baby:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this baby")

    # admin は常に許可
    if family_user.role == "admin":
        return baby

    # "baby" レベルの可視性チェック（record_type != "baby" のときも先にチェック）
    baby_perm = db.query(BabyPermission).filter(
        BabyPermission.baby_id == baby_id,
        BabyPermission.user_id == user_id,
        BabyPermission.record_type == "baby",
    ).first()
    if baby_perm and not baby_perm.can_view:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this baby")

    # 記録タイプ別の可視性チェック（"baby" 以外の record_type が指定された場合）
    if record_type != "baby":
        type_perm = db.query(BabyPermission).filter(
            BabyPermission.baby_id == baby_id,
            BabyPermission.user_id == user_id,
            BabyPermission.record_type == record_type,
        ).first()
        if type_perm and not type_perm.can_view:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied to {record_type} records for this baby"
            )

    return baby
```

**後方互換性**: 既存の呼び出し元は `record_type` を渡していないため、デフォルト値 `"baby"` が使用される。既存動作に影響なし。

---

### 既存エンドポイントの変更

各記録系 router で `verify_baby_access()` の呼び出しに `record_type` を追加する。

| ファイル | 変更箇所 | `record_type` 引数 |
|---------|---------|-------------------|
| `app/routers/feeding.py` | `verify_baby_access(db, baby_id, current_user.id)` | `"feeding"` |
| `app/routers/sleep.py` | 同上 | `"sleep"` |
| `app/routers/diaper.py` | 同上 | `"diaper"` |
| `app/routers/growth.py` | 同上 | `"growth"` |
| `app/routers/contraction.py` | 同上 | `"contraction"` |
| `app/routers/schedule.py` | 同上 | `"schedule"` |
| `app/routers/baby.py` | `GET /api/babies/` は **追加変更あり（後述）** | — |

#### `GET /api/babies/` の変更

全赤ちゃん一覧取得時に、`record_type="baby"` で `can_view=false` の赤ちゃんをフィルタする。

```python
@router.get("/", response_model=List[BabyResponse])
def get_babies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        return []

    babies = db.query(Baby).filter(Baby.family_id == family_user.family_id).all()

    # admin は全件返す
    if family_user.role == "admin":
        return babies

    # member: BabyPermission で can_view=false の赤ちゃんを除外
    hidden_baby_ids = set(
        perm.baby_id for perm in db.query(BabyPermission).filter(
            BabyPermission.user_id == current_user.id,
            BabyPermission.record_type == "baby",
            BabyPermission.can_view == False,
        ).all()
    )
    return [b for b in babies if b.id not in hidden_baby_ids]
```

#### `app/routers/baby.py` の `GET /{baby_id}/records` の変更

`verify_baby_access()` の呼び出しはそのままだが、返すレコード一覧で record_type ごとにフィルタする。

```python
@router.get("/{baby_id}/records", response_model=List[UnifiedRecord])
def get_records(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # "baby" レベルのアクセスチェック（record_type="baby" はデフォルトなので変更不要）
    verify_baby_access(db, baby_id, current_user.id)

    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    is_admin = family_user and family_user.role == "admin"

    def can_view_type(rt: str) -> bool:
        if is_admin:
            return True
        perm = db.query(BabyPermission).filter(
            BabyPermission.baby_id == baby_id,
            BabyPermission.user_id == current_user.id,
            BabyPermission.record_type == rt,
        ).first()
        return perm is None or perm.can_view

    records: List[UnifiedRecord] = []

    if can_view_type("feeding"):
        # ... 既存の feeding 取得ロジック
    if can_view_type("sleep"):
        # ... 既存の sleep 取得ロジック
    # 以降同様
```

---

### `app/main.py` への router 登録

```python
from app.routers import baby_permissions
app.include_router(baby_permissions.router)
```

---

## フロントエンド設計

### 設計方針

- `/settings/babies` の既存 `BabyCard` に「アクセス権限」ボタンを追加。
- ボタンタップで `BabyPermissionDialog` を開く（ページ遷移なし）。
- admin のみボタンを表示する。
- ファミリーに `member` ロールのユーザーが 0 人の場合はボタンを非表示（設定対象が存在しない）。

### コンポーネント構成

```
frontend/
  components/settings/
    BabyCard.tsx                    ← 既存（アクセス権限ボタンを追加）
    BabyPermissionDialog.tsx        ← 新規作成
      PermissionUserSection.tsx     ← 新規作成（1ユーザー分の権限切り替えUI）
  hooks/
    useBabyPermissions.ts           ← 新規作成（SWR フック）
```

### `BabyCard.tsx` への変更

```tsx
// admin かつ member が 1 人以上いる場合のみ表示
{isAdmin && hasMemberUsers && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => setPermissionDialogOpen(true)}
    className="text-violet-600 border-violet-200 hover:bg-violet-50"
  >
    <ShieldCheck className="w-4 h-4 mr-1" />
    アクセス権限
  </Button>
)}

<BabyPermissionDialog
  baby={baby}
  open={permissionDialogOpen}
  onOpenChange={setPermissionDialogOpen}
/>
```

### `BabyPermissionDialog.tsx`

**ダイアログの構成**:
```
┌─────────────────────────────────────────────┐
│  🔒 「レンくん」のアクセス権限              │
│  メンバーごとに閲覧できる記録を設定します    │
│                                             │
│  ── 田中 花子 ──────────────────────────── │
│  [赤ちゃん全体]  ● 表示  ○ 非表示           │
│                                             │
│  記録タイプ別設定（赤ちゃんが表示の場合のみ有効）│
│  授乳     [toggle: ON ]                     │
│  睡眠     [toggle: OFF]                     │
│  おむつ   [toggle: ON ]                     │
│  成長     [toggle: ON ]                     │
│  陣痛     [toggle: ON ]                     │
│  スケジュール [toggle: ON ]                  │
│                                             │
│  ── 山田 次郎 ──────────────────────────── │
│  [赤ちゃん全体]  ○ 表示  ● 非表示           │
│                                             │
│  記録タイプ別設定（グレーアウト・操作不可）   │
│  授乳     [toggle: -- ]                     │
│  ...                                        │
│                                             │
│              [キャンセル] [保存]             │
└─────────────────────────────────────────────┘
```

**UI 仕様**:
- 「赤ちゃん全体」を **非表示** にした場合、記録タイプ別トグルはすべてグレーアウトし操作不可にする（赤ちゃん自体が見えないため）。
- 変更はダイアログ内でローカルステートに保持し、「保存」ボタンで一括送信する。
- 保存後: ダイアログを閉じ、成功トーストを表示。`useBabies()` の mutate は不要（赤ちゃんデータ自体は変わらない）。

### `useBabyPermissions.ts`

```typescript
// hooks/useBabyPermissions.ts

import useSWR from "swr";

export type PermissionItem = {
  record_type: string;
  can_view: boolean;
};

export type UserPermissionSet = {
  user_id: number;
  username: string;
  permissions: PermissionItem[];
};

export type BabyPermissionsData = {
  baby_id: number;
  baby_name: string;
  members: UserPermissionSet[];
};

export function useBabyPermissions(babyId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<BabyPermissionsData>(
    babyId ? `/api/babies/${babyId}/permissions` : null,
    { revalidateOnFocus: false }
  );
  return { data, error, isLoading, mutate };
}

export async function updateBabyPermissions(
  babyId: number,
  permissions: { user_id: number; record_type: string; can_view: boolean }[]
): Promise<void> {
  const res = await fetch(`/api/babies/${babyId}/permissions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ permissions }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "権限の更新に失敗しました");
  }
}
```

### ダッシュボード・記録ページへの影響

フロントエンドでも権限に基づいた表示制御が必要。

#### `GET /api/babies/` レスポンスによるダッシュボード制御

- バックエンドが `GET /api/babies/` で `can_view=false` の赤ちゃんを除外するため、ダッシュボードのベビー選択肢から自動的に除外される。
- フロントエンド側での追加フィルタ処理は不要。

#### 記録ページでのエラーハンドリング

- バックエンドが `403` を返した場合（記録タイプ別制限）、ページ上に「この記録は閲覧できません」メッセージを表示する。
- 具体的な実装: SWR の `error` ステータスが `403` の場合の専用 UI を各記録ページに追加。

```tsx
if (error?.status === 403) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <ShieldOff className="w-12 h-12 mb-3" />
      <p>この記録は閲覧できません</p>
    </div>
  );
}
```

---

## 権限制御まとめ

| 操作 | admin | member（許可） | member（制限） |
|------|-------|--------------|--------------|
| `GET /api/babies/` | 全件返す | `can_view=false` 以外を返す | `can_view=false` の赤ちゃんは返さない |
| `GET /api/babies/{id}/permissions` | ✅ | ❌ 403 | ❌ 403 |
| `PUT /api/babies/{id}/permissions` | ✅ | ❌ 403 | ❌ 403 |
| `GET /api/feedings/?baby_id={id}` | ✅ | ✅ | `can_view=false` の場合 403 |
| 他記録系エンドポイント | ✅ | ✅ | `can_view=false` の場合 403 |
| ダッシュボードの赤ちゃん選択 | 全件表示 | 全件表示 | 非表示の赤ちゃんは選択肢に出ない |

---

## エラーハンドリング

| エラー条件 | バックエンド | フロントエンド |
|-----------|------------|--------------|
| 非 admin ユーザーが権限設定 API にアクセス | `403 Forbidden` | ボタン非表示（UI 制御）、かつ 403 発生時はトーストでエラー表示 |
| 無効な `record_type` | `400 Bad Request` | トースト「無効な値が含まれています」 |
| 別ファミリーの `user_id` を指定 | `400 Bad Request` | ダイアログ内にエラートースト |
| 存在しない `baby_id` | `404 Not Found` | ダイアログが開かないよう操作起点でハンドリング |
| ネットワークエラー | — | トースト「通信エラーが発生しました」 |

---

## ファイル変更・新規作成一覧

### バックエンド

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `app/schemas/baby_permission.py` | **新規作成** | `BabyPermissionItem`, `UserPermissionSet`, `BabyPermissionsResponse`, `BabyPermissionUpdate`, `UserPermissionEntry` |
| `app/routers/baby_permissions.py` | **新規作成** | `GET /api/babies/{baby_id}/permissions`, `PUT /api/babies/{baby_id}/permissions` |
| `app/dependencies.py` | **変更** | `verify_baby_access()` に `record_type: str = "baby"` 引数を追加、`BabyPermission` チェックを追加 |
| `app/routers/baby.py` | **変更** | `GET /api/babies/` に member 向けフィルタ追加。`GET /{baby_id}/records` に record_type 別フィルタ追加 |
| `app/routers/feeding.py` | **変更** | `verify_baby_access()` 呼び出しに `record_type="feeding"` を追加 |
| `app/routers/sleep.py` | **変更** | 同上 `"sleep"` |
| `app/routers/diaper.py` | **変更** | 同上 `"diaper"` |
| `app/routers/growth.py` | **変更** | 同上 `"growth"` |
| `app/routers/contraction.py` | **変更** | 同上 `"contraction"` |
| `app/routers/schedule.py` | **変更** | 同上 `"schedule"` |
| `app/main.py` | **変更** | `baby_permissions` router を `include_router` |

### フロントエンド

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `frontend/hooks/useBabyPermissions.ts` | **新規作成** | `useBabyPermissions` SWR フック、`updateBabyPermissions` 関数 |
| `frontend/components/settings/BabyPermissionDialog.tsx` | **新規作成** | 権限設定ダイアログ（ユーザー別 × record_type 別トグル） |
| `frontend/components/settings/BabyCard.tsx` | **変更** | 「アクセス権限」ボタン追加（admin かつ member 存在時のみ表示） |
| 各記録ページ (`app/(dashboard)/[record]/page.tsx` 等) | **変更** | SWR エラーが `403` の場合に「閲覧制限」UI を表示 |

---

## 実装チェックリスト

### バックエンド

- [ ] `app/schemas/baby_permission.py` 作成（上記スキーマ定義）
- [ ] `app/routers/baby_permissions.py` 作成
  - [ ] `GET /api/babies/{baby_id}/permissions` 実装
  - [ ] `PUT /api/babies/{baby_id}/permissions` 実装
  - [ ] admin ロールガード実装
  - [ ] 同一ファミリーの member のみ操作可能な検証実装
- [ ] `app/dependencies.py` の `verify_baby_access()` を拡張
  - [ ] `record_type: str = "baby"` 引数追加
  - [ ] `BabyPermission` の "baby" レベルチェック追加
  - [ ] `BabyPermission` の record_type レベルチェック追加
  - [ ] 既存の呼び出し元への後方互換性を確認
- [ ] `app/routers/baby.py` の変更
  - [ ] `GET /api/babies/` に hidden_baby_ids フィルタ追加
  - [ ] `GET /{baby_id}/records` に record_type 別フィルタ追加
- [ ] 各記録系 router（feeding, sleep, diaper, growth, contraction, schedule）に `record_type` 引数を追加
- [ ] `app/main.py` に `baby_permissions` router を登録
- [ ] `alembic upgrade head` で DB マイグレーション確認（スキーマ変更なし → 不要のはず）

### フロントエンド

- [ ] `frontend/hooks/useBabyPermissions.ts` 作成
- [ ] `frontend/components/settings/BabyPermissionDialog.tsx` 作成
  - [ ] `useBabyPermissions` フックでデータ取得
  - [ ] ユーザーごとに「赤ちゃん全体」ラジオボタン実装
  - [ ] 記録タイプ別トグルスイッチ 6 個実装
  - [ ] 「赤ちゃん全体」が非表示の場合、記録タイプ別トグルをグレーアウト
  - [ ] ローカルステートで変更を管理し、「保存」で一括 PUT
  - [ ] 保存成功時: ダイアログを閉じ、成功トースト表示
  - [ ] エラー時: トースト表示
- [ ] `frontend/components/settings/BabyCard.tsx` に「アクセス権限」ボタン追加
  - [ ] admin かつ family に member が 1 人以上いる場合のみ表示
  - [ ] `BabyPermissionDialog` の開閉状態を `useState` で管理
- [ ] 各記録ページに 403 エラー時の「閲覧制限」UI を追加
- [ ] `cd frontend && pnpm build` でビルド確認

---

## 参照先ドキュメント

- `.specify/specs/settings/family_settings.md` — 家族設定・メンバー管理
- `.specify/specs/settings/baby_settings.md` — 赤ちゃん管理画面（BabyCard, BabyEditDialog 等）
- `.specify/specs/ui/ui_design_system.md` — カラーパレット・コンポーネントデザイン
- `app/models/baby.py` — `Baby`, `BabyPermission` モデル
- `app/dependencies.py` — `verify_baby_access()` 実装
- `app/routers/baby.py` — 既存の赤ちゃん CRUD + 記録取得エンドポイント
