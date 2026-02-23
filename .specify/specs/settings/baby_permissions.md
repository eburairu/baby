# 赤ちゃんアクセス権限設定 仕様書 (Baby Permission Settings Specification)

## 概要

家族のメンバー（`member` / `viewer` ロール）ごとに、各赤ちゃんの閲覧可否および記録タイプ別の閲覧可否を admin が管理する機能。
本機能を提供する `/settings/permissions` ページは **Admin のみがアクセス可能**。

**設計方針（opt-in 型）**:

- 新規参加ユーザーは**何も見えない状態**でスタートする（デフォルト拒否）
- Admin が権限管理ページ（`/settings/permissions`）で明示的にアクセスを**許可**する
- 設定はメンバー中心の専用ページで管理し、メンバーが増えても扱いやすい UI を提供する

---

## 背景・既存の状態

- `BabyPermission` テーブル（`app/models/baby.py`）が存在する。
    - フィールド: `id`, `baby_id`, `user_id`, `record_type`, `can_view`
    - ユニーク制約: `(baby_id, user_id, record_type)`
- `verify_baby_access()`（`app/dependencies.py`）は `BabyPermission` を参照して権限チェックを行う。
- **デフォルト拒否**: `BabyPermission` レコードが存在しない場合、アクセスは**拒否**とみなす。

---

## 用語定義

| 用語 | 定義 |
|------|------|
| `record_type` | 権限制御の単位となる記録の種類。後述の有効値一覧を参照 |
| `"baby"` record_type | 赤ちゃん自体の可視性を制御する特殊な record_type |
| デフォルト拒否 | `BabyPermission` レコードが存在しない場合、その操作は**拒否**とみなす |
| admin 免除 | `admin` ロールのユーザーは常にすべてにアクセス可能。権限制御の対象外 |

---

## 権限モデル設計

### 制御粒度

2段階の階層制御を採用している。

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
3. BabyPermission に (baby_id=B, user_id=U, record_type=R) のレコードが存在し can_view=true → アクセス許可
4. 上記いずれにも該当しない → アクセス拒否（デフォルト拒否）
```

### 既存ユーザーとの互換性

- デフォルト拒否への変更に伴い、**Alembic マイグレーション**で既存ユーザーの現状を維持済み。
- マイグレーションで既存の MEMBER / VIEWER × 全 Baby × 全 record_type の組み合わせに `can_view=true` の `BabyPermission` レコードを一括挿入済み（ON CONFLICT DO NOTHING で重複を回避）。
- 既存ユーザーの閲覧体験は維持されている。

### Baby 新規追加時の挙動

- Admin が新しい Baby を追加した場合、既存の MEMBER / VIEWER にはその Baby の `BabyPermission` レコードが存在しない（デフォルト拒否）。
- Admin が権限管理ページで明示的にアクセスを許可するまで、既存メンバーにもその Baby は見えない。
- 権限管理ページでは未設定の Baby を持つメンバーを目立たせる（⚠️ バナー表示）。

---

## データベース設計

### テーブル定義

```python
# app/models/baby.py
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

### データマイグレーション（完了済み）

既存ユーザーへの影響を防ぐため、以下の Alembic マイグレーションを実行済み。

```sql
-- 既存の MEMBER/VIEWER × Baby × 全 record_type に can_view=true を挿入
INSERT INTO baby_permissions (baby_id, user_id, record_type, can_view)
SELECT b.id, fu.user_id, r.record_type, true
FROM babies b
JOIN family_users fu ON fu.family_id = b.family_id AND fu.role != 'admin'
CROSS JOIN (
    VALUES ('baby'),('feeding'),('sleep'),('diaper'),('growth'),('contraction'),('schedule'),('note')
) AS r(record_type)
ON CONFLICT (baby_id, user_id, record_type) DO NOTHING;
```

---

## バックエンド設計

### `dependencies.py`

#### `verify_baby_access()`（デフォルト拒否）

```python
def verify_baby_access(
    db: Session,
    baby_id: int,
    user_id: int,
    record_type: str = "baby",
    require_write: bool = False
) -> Baby:
    """
    baby_id がユーザーのファミリーに属するか検証し、
    BabyPermission による閲覧権限もチェックする（デフォルト拒否）。
    失敗時 403 を raise。
    """
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()
    if not family_user:
        raise HTTPException(status_code=403, detail="Not in a family")

    if require_write and family_user.role == UserRole.VIEWER:
        raise HTTPException(status_code=403, detail="Viewer role cannot write")

    baby = db.query(Baby).filter(
        Baby.id == baby_id,
        Baby.family_id == family_user.family_id,
    ).first()
    if not baby:
        raise HTTPException(status_code=403, detail="Access denied to this baby")

    # admin は常に許可
    if family_user.role == UserRole.ADMIN:
        return baby

    # "baby" レベルの可視性チェック
    baby_perm = db.query(BabyPermission).filter(
        BabyPermission.baby_id == baby_id,
        BabyPermission.user_id == user_id,
        BabyPermission.record_type == "baby",
    ).first()
    # can_view=true のレコードがない → デフォルト拒否
    if not baby_perm or not baby_perm.can_view:
        raise HTTPException(status_code=403, detail="Access denied to this baby")

    # 記録タイプ別の可視性チェック（"baby" 以外の record_type が指定された場合）
    if record_type != "baby":
        type_perm = db.query(BabyPermission).filter(
            BabyPermission.baby_id == baby_id,
            BabyPermission.user_id == user_id,
            BabyPermission.record_type == record_type,
        ).first()
        # can_view=true のレコードがない → デフォルト拒否
        if not type_perm or not type_perm.can_view:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied to {record_type} records for this baby"
            )

    return baby
```

### `GET /api/babies/` のフィルタロジック

```python
@router.get("/", response_model=List[BabyResponse])
def get_babies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        return []

    babies = db.query(Baby).filter(Baby.family_id == family_user.family_id).all()

    # admin は全件返す
    if family_user.role == UserRole.ADMIN:
        return babies

    # member/viewer: can_view=true の BabyPermission が存在する赤ちゃんのみ返す（デフォルト拒否）
    allowed_baby_ids = set(
        perm.baby_id for perm in db.query(BabyPermission).filter(
            BabyPermission.user_id == current_user.id,
            BabyPermission.record_type == "baby",
            BabyPermission.can_view == True,
        ).all()
    )
    return [b for b in babies if b.id in allowed_baby_ids]
```

### API エンドポイント

#### `GET /api/babies/{baby_id}/permissions`

**概要**: 指定した赤ちゃんの全メンバーに対する権限一覧を返す。
**権限**: admin のみ

**レスポンス例**（デフォルト拒否）:
`BabyPermission` レコードが存在しない record_type は `can_view: false` として返される。

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
        ...
      ]
    }
  ]
}
```

#### `PUT /api/babies/{baby_id}/permissions`

**概要**: 指定した赤ちゃんの権限を一括更新する（upsert）。
**権限**: admin のみ

---

## フロントエンド設計

### 設計方針

- **専用ページ** `/settings/permissions` を提供（ダイアログ型から移行済み）。
- **メンバー中心**の管理 UI：メンバーを軸に、各メンバーが閲覧できる赤ちゃんを設定する。
- メンバーが多い場合でも扱いやすいよう、検索・アコーディオン・一括操作を備える。

### 画面構成

```
┌─────────────────────────────────────────┐
│ ← 戻る    権限管理                     │   ← sticky header h-14
└─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🔒 赤ちゃんへのアクセス権限                             │
│ メンバーがどの赤ちゃんの情報を見られるか管理します       │
│                                                         │
│ [🔍 メンバーを検索...]                                  │
│                                                         │
│ ── 田中 花子 (メンバー) ─────────────────────────────  │
│ 👶 レンくん      [全て許可 ✅]  [詳細設定 ▼]           │
│    └ 授乳:✅  睡眠:✅  おむつ:❌  成長:✅  ...（展開時）│
│ 👶 はなちゃん    [アクセスなし ❌] [許可する]           │
│                                                         │
│ ── 山田 次郎 (閲覧者) ───────────────────────────────  │
│ ⚠️ すべての赤ちゃんへのアクセスが未設定です             │
│ 👶 レンくん      [許可する]                             │
│ 👶 はなちゃん    [許可する]                             │
└─────────────────────────────────────────────────────────┘
```

### コンポーネント構成

```
  frontend/app/(dashboard)/settings/permissions/page.tsx
    ← 権限管理専用ページ（Admin のみアクセス）

  frontend/components/settings/MemberPermissionCard.tsx
    ← 1メンバー分の権限管理UI（アコーディオン型）

  frontend/components/settings/BabyAccessRow.tsx
    ← MemberPermissionCard 内の Baby 毎の行コンポーネント

  frontend/hooks/usePermissionsPage.ts
    ← useSWR で GET /api/babies/{baby_id}/permissions を取得するフック

  frontend/components/settings/BabyCard.tsx
    ← 「アクセス権限」ボタンを削除済み（専用ページで管理）

  frontend/app/(dashboard)/settings/page.tsx（または navigation）
    ← 「権限管理」メニュー項目を追加済み
```

### ダッシュボード・記録ページへの影響

#### `GET /api/babies/` レスポンスによるダッシュボード制御

- バックエンドが `GET /api/babies/` で `can_view=true` の赤ちゃんのみ返す。
- ダッシュボードの Baby 選択肢は自動的に制御される。

#### 記録ページでのエラーハンドリング

- バックエンドが `403` を返した場合（記録タイプ別制限）、「この記録は閲覧できません」メッセージを表示する。

---

## 権限制御まとめ

| 操作 | admin | member/viewer（許可済み） | member/viewer（未設定・拒否） |
|------|-------|------------------------|---------------------------|
| `GET /api/babies/` | 全件返す | `can_view=true` の赤ちゃんのみ返す | 返さない |
| `GET /api/babies/{id}/permissions` | ✅ | ❌ 403 | ❌ 403 |
| `PUT /api/babies/{id}/permissions` | ✅ | ❌ 403 | ❌ 403 |
| `GET /api/feedings/?baby_id={id}` | ✅ | ✅ | 403 |
| 他記録系エンドポイント | ✅ | ✅ | 403 |
| ダッシュボードの赤ちゃん選択 | 全件表示 | 許可済みのみ表示 | 表示されない |

---

## エラーハンドリング

| エラー条件 | バックエンド | フロントエンド |
|-----------|------------|--------------|
| 非 admin ユーザーが権限設定 API にアクセス | `403 Forbidden` | ページ自体が Admin のみ表示のため到達しない |
| 無効な `record_type` | `400 Bad Request` | トースト「無効な値が含まれています」 |
| 別ファミリーの `user_id` を指定 | `400 Bad Request` | 発生しない（同一ファミリーのメンバーのみ表示） |
| 存在しない `baby_id` | `404 Not Found` | 発生しない（同一ファミリーの Baby のみ表示） |
| ネットワークエラー | — | トースト「通信エラーが発生しました」 |

---

## 実装状況（完了）

本機能は「デフォルト拒否（Opt-in）」モデルとして完全に実装されている。

### バックエンド

- **実装済み**: `app/dependencies.py` の `verify_baby_access()`（デフォルト拒否）
- **実装済み**: `app/routers/baby.py` の `GET /api/babies/`（デフォルト拒否フィルタ）
- **実装済み**: `app/routers/baby_permissions.py` の `GET/PUT` エンドポイント
- **実装済み**: Alembic マイグレーションによる既存データの移行

### フロントエンド

- **実装済み**: `frontend/app/(dashboard)/settings/permissions/page.tsx`
- **実装済み**: メンバー中心の管理 UI コンポーネント群
- **実装済み**: 旧 UI（ダイアログ等）の廃止と統合

---

## 参照先ドキュメント

- `.specify/specs/settings/family_settings.md` — 家族設定・メンバー管理
- `.specify/specs/settings/baby_settings.md` — 赤ちゃん管理画面（BabyCard 等）
- `app/models/baby.py` — `Baby`, `BabyPermission` モデル
- `app/dependencies.py` — `verify_baby_access()` 実装
- `app/routers/baby.py` — 既存の赤ちゃん CRUD + 記録取得エンドポイント
