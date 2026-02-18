# ロールベースアクセス制御 (RBAC) 仕様書

## 概要

Baby App は、家族単位での育児記録の共同管理を前提としたアプリケーションである。
本ドキュメントでは、家族内のユーザーに割り当てられる **3 つのロール**（ADMIN / MEMBER / VIEWER）と、それぞれの権限を定義する。

---

## ロール定義

| ロール | 説明 | 割り当てタイミング |
| :--- | :--- | :--- |
| **ADMIN** | 家族の管理者。すべての操作が可能 | 家族新規作成時、作成者に自動付与 |
| **MEMBER** | 一般メンバー。記録の閲覧・作成・編集・削除が可能 | ADMIN が VIEWER から昇格させた場合 |
| **VIEWER** | 閲覧者。記録の閲覧のみ可能 | 招待コードで家族に参加した際のデフォルト |

### ロール値

```python
# app/models/family.py
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"
```

---

## 権限マトリクス

### 機能別権限

| 操作カテゴリ | 具体的な操作 | ADMIN | MEMBER | VIEWER |
| :--- | :--- | :---: | :---: | :---: |
| **記録の閲覧** | 授乳・睡眠・おむつ・成長・陣痛・スケジュール・メモ・AIサマリーの閲覧 | ✅ | ✅ | ✅ |
| **記録の書き込み** | 上記の記録の作成・編集・削除 | ✅ | ✅ | ❌ |
| **画像アップロード** | 記録への画像添付 | ✅ | ✅ | ❌ |
| **コメント投稿** | 記録へのコメント（応援メッセージ） | ✅ | ✅ | ✅ |
| **コメント削除** | 自分のコメントの削除 | ✅ | ✅ | ✅ |
| **他者コメント削除** | 他ユーザーのコメントを削除 | ✅ | ❌ | ❌ |
| **赤ちゃん管理** | 赤ちゃんの追加・編集・削除 | ✅ | ❌ | ❌ |
| **ファミリー管理** | ファミリー名の変更 | ✅ | ❌ | ❌ |
| **招待コード** | 招待コードの再生成 | ✅ | ❌ | ❌ |
| **メンバー管理** | メンバーのロール変更・削除 | ✅ | ❌ | ❌ |
| **アクセス権限設定** | BabyPermission（赤ちゃん別の閲覧制限）の管理 | ✅ | ❌ | ❌ |
| **プロフィール管理** | 自分の表示名の変更 | ✅ | ✅ | ✅ |
| **通知設定** | プッシュ通知の購読・設定変更・テスト送信 | ✅ | ✅ | ✅ |

### エンドポイント別権限

| エンドポイント | メソッド | ADMIN | MEMBER | VIEWER |
| :--- | :--- | :---: | :---: | :---: |
| **赤ちゃん** | | | | |
| `/api/babies/` | GET | ✅ | ✅ ※1 | ✅ ※1 |
| `/api/babies/` | POST | ✅ | ❌ | ❌ |
| `/api/babies/{id}` | PATCH, DELETE | ✅ | ❌ | ❌ |
| `/api/babies/{id}/records` | GET | ✅ | ✅ ※1 | ✅ ※1 |
| `/api/babies/{id}/records` | POST | ✅ | ✅ | ❌ |
| **記録系** | | | | |
| `/api/feedings/` | GET | ✅ | ✅ ※2 | ✅ ※2 |
| `/api/feedings/` | POST, PATCH, DELETE | ✅ | ✅ | ❌ |
| `/api/sleeps/` | GET | ✅ | ✅ ※2 | ✅ ※2 |
| `/api/sleeps/` | POST, PATCH, DELETE | ✅ | ✅ | ❌ |
| `/api/diapers/` | GET | ✅ | ✅ ※2 | ✅ ※2 |
| `/api/diapers/` | POST, PUT, DELETE | ✅ | ✅ | ❌ |
| `/api/growth/` | GET | ✅ | ✅ ※2 | ✅ ※2 |
| `/api/growth/` | POST, PUT, DELETE | ✅ | ✅ | ❌ |
| `/api/contractions/` | GET | ✅ | ✅ ※2 | ✅ ※2 |
| `/api/contractions/` | POST, PATCH, DELETE | ✅ | ✅ | ❌ |
| `/api/contractions/{id}/stop` | PATCH | ✅ | ✅ | ❌ |
| `/api/schedules/` | GET | ✅ | ✅ ※2 | ✅ ※2 |
| `/api/schedules/` | POST, DELETE | ✅ | ✅ | ❌ |
| `/api/notes/` | GET | ✅ | ✅ ※2 | ✅ ※2 |
| `/api/notes/` | POST, PATCH, DELETE | ✅ | ✅ | ❌ |
| `/api/ai_summary/` | GET | ✅ | ✅ | ✅ |
| `/api/ai_summary/` | POST, PATCH, DELETE | ✅ | ✅ | ❌ |
| **コメント** | | | | |
| `/api/records/{type}/{id}/comments` | GET | ✅ | ✅ | ✅ |
| `/api/records/{type}/{id}/comments` | POST | ✅ | ✅ | ✅ |
| `/api/comments/{id}` | DELETE | ✅ ※3 | ✅ ※4 | ✅ ※4 |
| **ファイル** | | | | |
| `/api/upload/image` | POST | ✅ | ✅ | ❌ |
| **ファミリー管理** | | | | |
| `/api/family/` | GET | ✅ | ✅ | ✅ |
| `/api/family/` | PATCH | ✅ | ❌ | ❌ |
| `/api/family/invite_code/regenerate` | POST | ✅ | ❌ | ❌ |
| `/api/family/members` | GET | ✅ | ✅ | ✅ |
| `/api/family/members/{id}/role` | PATCH | ✅ | ❌ | ❌ |
| `/api/family/members/{id}` | DELETE | ✅ | ❌ | ❌ |
| `/api/babies/{id}/permissions` | GET, PUT | ✅ | ❌ | ❌ |
| **認証・プロフィール** | | | | |
| `/api/auth/register/family` | POST | — ※5 | — | — |
| `/api/auth/register/join` | POST | — ※5 | — | — |
| `/api/auth/login` | POST | — ※5 | — | — |
| `/api/auth/logout` | POST | ✅ | ✅ | ✅ |
| `/api/auth/me` | GET | ✅ | ✅ | ✅ |
| `/api/auth/me` | PATCH | ✅ | ✅ | ✅ |
| **通知** | | | | |
| `/api/notifications/subscribe` | POST | ✅ | ✅ | ✅ |
| `/api/notifications/unsubscribe` | POST | ✅ | ✅ | ✅ |
| `/api/notifications/settings` | GET, PATCH | ✅ | ✅ | ✅ |
| `/api/notifications/test` | POST | ✅ | ✅ | ✅ |

> [!NOTE]
> - ※1: `BabyPermission` で `can_view=false` に設定された赤ちゃんは結果から除外される（ADMIN は免除）
> - ※2: `BabyPermission` で当該 `record_type` の `can_view=false` が設定されている場合は `403` を返す（ADMIN は免除）
> - ※3: ADMIN は他ユーザーのコメントも削除可能
> - ※4: 自分のコメントのみ削除可能
> - ※5: 認証前のエンドポイント。RBAC のロールチェック対象外（未認証ユーザーがアクセス）

> [!NOTE]
> コメント投稿対象の `record_type` は `feeding / sleep / diaper / growth / contraction / schedule / note` の 7 種類。`ai_summary` はコメント対象外。

---

## バックエンド実装

### 権限チェックの仕組み

RBAC は以下の **3 つの関数** で制御される。

#### 1. `verify_baby_access()` — 赤ちゃんアクセス検証

```python
# app/dependencies.py
def verify_baby_access(
    db: Session,
    baby_id: int,
    user_id: int,
    record_type: str = "baby",
    require_write: bool = False
) -> Baby:
```

- ユーザーが指定された赤ちゃんの同一ファミリーに所属するか検証
- `require_write=True` の場合、VIEWER ロールを `403` で拒否
- ADMIN は `BabyPermission` チェックをスキップ（常に許可）
- MEMBER / VIEWER は `BabyPermission` によるレコードタイプ別の閲覧制限に従う

#### 2. `verify_write_access()` — 書き込み権限検証

```python
# app/dependencies.py
def verify_write_access(db: Session, user_id: int) -> FamilyUser:
```

- ユーザーが ADMIN または MEMBER であることを確認
- VIEWER の場合は `403 Forbidden` を返す
- 赤ちゃんに紐づかない書き込み操作（画像アップロード等）で使用

#### 3. `_require_admin()` — 管理者権限検証

```python
# app/routers/family.py
def _require_admin(family_user: FamilyUser) -> None:
```

- ユーザーが ADMIN であることを確認
- ADMIN 以外は `403 Admin role required` を返す
- ファミリー管理・メンバー管理系のエンドポイントで使用

### 権限チェックの適用箇所

| チェック関数 | 適用エンドポイント |
| :--- | :--- |
| `verify_baby_access(require_write=True)` | 全記録系（feeding / sleep / diaper / growth / contraction / schedule / note / ai_summary）のミューテーション操作 |
| `verify_baby_access()` | 全記録系の GET 操作 |
| `verify_write_access()` | `/api/upload/image` (POST) |
| `_require_admin()` | `/api/family/` (PATCH), `/api/family/invite_code/regenerate`, `/api/family/members/{id}/role`, `/api/family/members/{id}` (DELETE), `/api/babies/{id}/permissions` |
| `baby.py` 内の直接チェック | `/api/babies/` (POST, PATCH, DELETE) — `family_user.role != UserRole.ADMIN` で拒否 |

### ロール変更・メンバー管理の制約

- **最終 ADMIN の降格禁止**: ファミリーに ADMIN が 1 人しかいない場合、そのユーザーの ADMIN ロールを変更できない（`400 At least one admin is required`）
- **自分自身のロール変更**: 現在の実装では ADMIN が自分自身のロールを変更可能（ADMIN が 2 人以上いる場合）
- **⚠️ 最終 ADMIN の自己削除防止（未実装）**: `delete_member` で最終 ADMIN が自分自身を削除できてしまう問題あり。降格と同様にガードが必要
- **無効なロール値の拒否**: Pydantic バリデーションにより、`UserRole` enum に存在しない値は `422` で拒否

---

## フロントエンド実装

### `usePermissions` フック

```typescript
// frontend/hooks/usePermissions.ts
export function usePermissions() {
    const { user } = useUser();
    const isAdmin = user?.role === UserRole.ADMIN;
    const isViewer = user?.role === UserRole.VIEWER;
    const isMember = user?.role === UserRole.MEMBER;
    const canWrite = isAdmin || isMember;
    return { isAdmin, isViewer, isMember, canWrite };
}
```

### UI での表示制御

| ロール | UI 要素の状態 |
| :--- | :--- |
| **ADMIN** | すべての操作ボタン・メニューを表示 |
| **MEMBER** | 記録の作成・編集・削除ボタンを表示。ファミリー管理・赤ちゃん管理ボタンは非表示 |
| **VIEWER** | FAB（記録ボタン）非表示、編集・削除メニュー非表示、設定画面の管理系ボタン非表示 |

### VIEWER におけるUI制御の具体的な適用箇所

- 各記録画面の「記録する」ボタン（Floating Action Button）
- 記録一覧の編集・削除メニュー / ボタン
- アクティビティフィード（最近の記録）の編集ダイアログにおける「保存」「削除」ボタンの非表示、および入力項目の無効化（読み取り専用）
- 赤ちゃん設定の追加・編集・削除ボタン（ADMIN 以外は非表示）
- ファミリー設定の名前変更・招待コード再生成・メンバー削除ボタン（ADMIN 以外は非表示）

### ファミリー設定画面でのロール表示

- メンバー一覧で各ユーザーのロール（管理者 / メンバー / 閲覧者）を表示
- ADMIN のみ、他メンバーのロールを変更可能

---

## BabyPermission との関係

RBAC のロールシステムとは別に、**赤ちゃん単位のきめ細かい閲覧制限** を `BabyPermission` テーブルで制御する。詳細は [baby_permissions.md](file:///Users/ry1e/Documents/work/baby/.specify/specs/settings/baby_permissions.md) を参照。

- ADMIN は `BabyPermission` の制約を受けない（常にすべてにアクセス可能）
- MEMBER / VIEWER は `can_view=false` が設定された赤ちゃん・記録タイプにアクセスできない
- `BabyPermission` レコードが存在しない場合はデフォルト許可

---

## 実装チェックリスト

### バックエンド

- [x] `UserRole` enum の定義（`app/models/family.py`）
- [x] `join_family` のデフォルトロールを `VIEWER` に設定（`app/routers/auth.py`）
- [x] `verify_baby_access()` に `require_write` オプション追加（`app/dependencies.py`）
- [x] `verify_write_access()` の実装（`app/dependencies.py`）
- [x] 全記録系ルーターのミューテーション操作に書き込み権限チェック適用
- [x] `update_member_role` で VIEWER への変更を許可（`app/routers/family.py`）
- [x] 最終 ADMIN の降格防止ガード

### フロントエンド

- [x] `UserRole` 定数の定義（`frontend/lib/constants.ts`）
- [x] `usePermissions` フックの実装（`frontend/hooks/usePermissions.ts`）
- [x] 各記録画面の FAB・編集/削除ボタンの表示制御
- [x] `RecordDetailDialog` での VIEWER 制限（保存・削除非表示、入力無効化）
- [x] ファミリー設定画面でのロール表示と変更機能

### テスト

#### 実装済み（`tests/test_viewer_role.py`, `tests/test_role_validation.py`）

- [x] VIEWER ロールで `join_family` されることを確認（`test_viewer_default_on_join`）
- [x] VIEWER ロールが GET エンドポイント（閲覧）にアクセスできることを確認（`test_viewer_read_only_access`）
- [x] VIEWER ロールが POST/DELETE エンドポイントにアクセスした際、`403` が返ることを確認（`test_viewer_read_only_access`）
- [x] ADMIN が VIEWER を MEMBER に変更でき、MEMBER が記録を作成できることを確認（`test_admin_can_change_role`）
- [x] 無効なロール値での更新が `422` で拒否されることを確認（`test_update_role_with_invalid_value`）

#### 未実装テスト

- [ ] 最終 ADMIN の降格が拒否されることを確認
- [ ] 最終 ADMIN の自己削除が拒否されることを確認
- [ ] VIEWER がコメントを投稿できることを確認
- [ ] VIEWER が自分のコメントを削除できることを確認
- [ ] MEMBER / VIEWER が他者のコメントを削除できないことを確認
- [ ] 通知系エンドポイントに全ロールがアクセスできることを確認

---

## 影響範囲・互換性

- 既存の MEMBER ユーザーには影響なし（既存ユーザーのロールは維持される）
- 新規参加ユーザーのみ、初期状態が VIEWER（閲覧のみ）に制限される
- 認証仕様については [authentication.md](file:///Users/ry1e/Documents/work/baby/.specify/specs/auth/authentication.md) を参照

---

## 参照先ドキュメント

- [authentication.md](file:///Users/ry1e/Documents/work/baby/.specify/specs/auth/authentication.md) — 認証・セッション管理
- [baby_permissions.md](file:///Users/ry1e/Documents/work/baby/.specify/specs/settings/baby_permissions.md) — 赤ちゃん別アクセス権限
- [family_settings.md](file:///Users/ry1e/Documents/work/baby/.specify/specs/settings/family_settings.md) — ファミリー管理
