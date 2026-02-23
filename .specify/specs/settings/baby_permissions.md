# 赤ちゃんアクセス権限設定 仕様書 (Baby Permission Settings Specification)

## 概要

家族のメンバー（`member` / `viewer` ロール）ごとに、各赤ちゃんの閲覧可否および記録タイプ別の閲覧可否を admin が管理する機能。
本機能を提供する `/settings/permissions` ページは **Admin のみがアクセス可能**。

**設計方針（opt-in 型）**:

- 新規参加ユーザーは**何も見えない状態**でスタートする（デフォルト拒否）
- Admin が権限管理ページ（`/settings/permissions`）で明示的にアクセスを**許可**する
- 設定はメンバー中心の専用ページで管理し、メンバーが増えても扱いやすい UI を提供する

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
3. BabyPermission に (baby_id=B, user_id=U, record_type=R) のレコードが存在し can_view=true → アクセス許可
4. 上記いずれにも該当しない → アクセス拒否（デフォルト拒否）
```

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

---

## バックエンド仕様

### `dependencies.py`

`verify_baby_access()` は**デフォルト拒否**を強制する。

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

### API エンドポイント

#### `GET /api/babies/`

**概要**: ユーザーが閲覧可能な赤ちゃんのみをリストアップする。

**処理ロジック**:
- admin: ファミリー内の全赤ちゃんを返す。
- member/viewer: `can_view=true` かつ `record_type="baby"` の `BabyPermission` が存在する赤ちゃんのみ返す（opt-in 型）。

#### `GET /api/babies/{baby_id}/permissions`

**概要**: 指定した赤ちゃんの全メンバーに対する権限一覧を返す。

**権限**: admin のみ

**レスポンス**:
- `BabyPermission` レコードが存在しない `record_type` については、`can_view: false` （デフォルト拒否）として返す。

#### `PUT /api/babies/{baby_id}/permissions`

**概要**: 指定した赤ちゃんの権限を一括更新する（upsert）。

**権限**: admin のみ

---

## フロントエンド仕様

### 画面構成

**権限管理ページ** (`/settings/permissions`) は Admin ユーザーにのみ表示される。

```
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

- **権限管理専用ページ**: `frontend/app/(dashboard)/settings/permissions/page.tsx`
- **メンバー毎のUI**: `frontend/components/settings/MemberPermissionCard.tsx`
- **赤ちゃん毎の行**: `frontend/components/settings/BabyAccessRow.tsx`
- **データ取得フック**: `frontend/hooks/usePermissionsPage.ts`

### UI インタラクション

- **「許可する」**: `baby` + 全 record_type を `can_view=true` で一括更新。
- **「詳細設定 ▼」**: アコーディオンを展開し、記録タイプごとのトグルスイッチで個別に制御。
- **「アクセスなし」**: 該当ユーザーに対してその赤ちゃんを完全に非表示にする。

### ダッシュボード・記録ページの挙動

- **ダッシュボード**: `GET /api/babies/` が返す赤ちゃんのみ選択肢に表示される。
- **記録ページ**: アクセス権限のない記録タイプにアクセスした場合、バックエンドから `403 Forbidden` が返され、UI にエラーメッセージが表示される。

---

## 実装状況 (Implementation Status)

以下の機能はすべて実装済みであり、本番稼働している。

### バックエンド
- [x] `app/dependencies.py`: `verify_baby_access()` でのデフォルト拒否
- [x] `app/routers/baby.py`: `GET /api/babies/` での `allowed_baby_ids` フィルタリング
- [x] `app/routers/baby_permissions.py`: `GET` レスポンスのデフォルト値 (`False`) 設定
- [x] `BabyPermission` テーブルとPydanticスキーマ

### フロントエンド
- [x] 権限管理専用ページ (`/settings/permissions`)
- [x] メンバー中心の管理UI (`MemberPermissionCard.tsx`)
- [x] 設定メニューへの「権限管理」追加

---

## 参照先ドキュメント

- `.specify/specs/settings/family_settings.md` — 家族設定・メンバー管理
- `.specify/specs/settings/baby_settings.md` — 赤ちゃん管理画面
- `app/models/baby.py` — `Baby`, `BabyPermission` モデル
- `app/dependencies.py` — `verify_baby_access()` 実装
