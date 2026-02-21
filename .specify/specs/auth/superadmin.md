# SuperAdmin（システム管理者）仕様書

## 概要

Baby App のシステム全体を管理するための権限（SuperAdmin）を定義する。
これは家族内の「ADMIN」ロールとは異なり、システム上の全データに対して管理権限を持つ特別なユーザーである。

---

## SuperAdmin の定義

### ユーザー属性の拡張

`User` モデルに `is_superadmin` フィールド（Boolean）を追加する。
このフラグが `True` のユーザーのみが、システム管理機能にアクセスできる。

```python
# app/models/user.py
class User(Base):
    # ... 既存のフィールド ...
    is_superadmin = Column(Boolean, nullable=False, default=False)
```

### 認証・認可

- **認証**: 通常の Cookie ベースセッションを使用する。
- **認可**: `/api/admin/` 以下のエンドポイントは、`user.is_superadmin` のチェックを必須とする。

---

## 権限マトリクス（システム管理）

SuperAdmin は、家族やユーザーを横断して管理するための以下の権限を持つ。

| 機能カテゴリ | 具体的な操作 | 内容 |
| :--- | :--- | :--- |
| **ダッシュボード** | システム統計の閲覧 | 全ユーザー数、全家族数、全記録数などの確認 |
| **家族管理** | 家族一覧の閲覧 | システム内の全家族の一覧表示、検索 |
| **家族管理** | 家族詳細の閲覧 | 家族名、作成日、所属メンバー、登録されている赤ちゃんの確認 |
| **ユーザー管理** | ユーザー一覧の閲覧 | システム内の全ユーザーの一覧表示、検索、最終ログイン日の確認 |
| **ユーザー管理** | SuperAdmin 権限の付与 | 他のユーザーに対して `is_superadmin` フラグを操作する（既存 SuperAdmin のみ実行可能） |
| **システム設定** | お知らせの管理（予定） | システム全体へのお知らせの作成・編集・削除 |

### スキーマの拡張

API レスポンスに `is_superadmin` を含めるため、`UserResponse` スキーマを更新する。

```python
# app/schemas/user.py
class UserResponse(BaseModel):
    # ... 既存のフィールド ...
    is_superadmin: bool = False
```

> [!IMPORTANT]
> **既存の `role` フィールドとの区別**: 
> `UserResponse` やフロントエンドの `User` 型に含まれる既存の `role` は、**現在ログイン中の家族コンテキストにおけるロール**（ADMIN / MEMBER / VIEWER）を指す。
> `is_superadmin` はこれとは独立した、**アプリ全体に対する権限フラグ**として扱う。

---

## バックエンド実装方針

### 権限チェックの依存関係

新しい依存関係 `get_current_superadmin` を定義する。

```python
# app/dependencies.py
def get_current_superadmin(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="SuperAdmin privileges required"
        )
    return current_user
```

### 管理用 API エンドポイント (`/api/admin/`)

以下のエンドポイントを `app/routers/admin.py` に実装する。

- `GET /api/admin/stats`: システム全体の統計情報を取得
- `GET /api/admin/families`: 家族一覧を取得（ページネーション、検索対応）
- `GET /api/admin/users`: ユーザー一覧を取得（ページネーション、検索対応）
- `PATCH /api/admin/users/{user_id}/superadmin`: SuperAdmin 権限を切り替え

---

## フロントエンド実装方針

### 管理画面のルーティング

`/admin` パス以下に管理者専用の画面を構築する。
通常のユーザー画面とはナビゲーションを分離し、ヘッダー等のデザインを明確に分ける。

- `/admin`: 管理者ダッシュボード
- `/admin/families`: 家族一覧・詳細
- `/admin/users`: ユーザー一覧・権限管理

### アクセス制御（ミドルウェア/ガード）

フロントエンドでも、非 SuperAdmin ユーザーが `/admin` にアクセスした場合、トップページにリダイレクトするか、403 エラーを表示するガードを実装する。

```typescript
// frontend/components/auth/SuperAdminGuard.tsx
export function SuperAdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useUser();
  if (isLoading) return <LoadingSpinner />;
  if (!user?.is_superadmin) return <ForbiddenPage />;
  return <>{children}</>;
}
```

---

## 影響範囲・セキュリティ考慮事項

### 既存の RBAC との分離

SuperAdmin 権限は家族内の RBAC（ADMIN / MEMBER / VIEWER）とは完全に独立して管理される。
SuperAdmin であっても、明示的に家族に所属していない限り、その家族のプライベートな育児記録（授乳・睡眠等）を閲覧することはできない（デフォルトのセキュリティ境界は維持する）。

> [!CAUTION]
> SuperAdmin 画面では家族の統計情報を扱うが、個別の詳細な育児内容（メモの内容や画像など）は、プライバシー保護の観点から、管理者であってもデフォルトでは表示しない設計とする。

### 初回 SuperAdmin の設定

最初の SuperAdmin ユーザーは、DB への直接操作（SQL またはスクリプト）によってのみ設定可能とする。

```bash
# 例: ユーザー ID 1 を SuperAdmin に設定
python scripts/set_superadmin.py --user-id 1
```

---

## 実装チェックリスト

### バックエンド

- [ ] `User` モデルに `is_superadmin` カラムを追加
- [ ] Alembic マイグレーションの実行
- [ ] `get_current_superadmin` 依存関係の実装
- [ ] `app/routers/admin.py` の新規作成と API 実装
- [ ] 初回 SuperAdmin 設定用スクリプトの作成

### フロントエンド

- [ ] `User` 型に `is_superadmin` プロパティを追加
- [ ] 管理者専用レイアウト・ヘッダーの作成
- [ ] `/admin` 配下のページ（ダッシュボード、家族一覧、ユーザー一覧）の実装
- [ ] 設定画面等に「管理者画面へ」のリンクを表示（SuperAdmin のみ）
