# 家族管理画面 仕様書 (Family Settings Specification)

## 概要

Baby App の家族設定画面（`/settings/family`）の仕様。
家族名の編集、招待コードの管理、メンバーの一覧・ロール変更・削除を行う管理画面。
エントリポイントはダッシュボードヘッダーの Settings アイコン。

## デザインコンセプト

`ui_design_system.md` の統一レイアウトに準拠する。

- **ページ背景**: `bg-slate-50`
- **カード**: `rounded-2xl shadow-sm border-0 bg-white`
- **ヘッダー**: sticky、`h-14 py-3 px-4`、戻るボタン付き
- **アクションカラー**:
    - プライマリボタン: `bg-indigo-600 hover:bg-indigo-700 text-white`
    - 危険操作（削除）: `bg-red-500 hover:bg-red-600 text-white`
    - キャンセル: shadcn `variant="outline"`
- **設定画面カテゴリーカラー**: `violet` 系（設定・管理を示す）
    - タイトル色: `text-violet-600`
    - ライトBG: `bg-violet-50`

## ユーザーストーリー

- 家族名を「田中家」から「田中ファミリー」に変更したい。
- パートナーに招待コードを伝えるため、コードをコピーしてシェアしたい。
- 招待コードが漏洩したため、すぐに新しいコードに再生成したい。
- 今どのメンバーが家族に参加しているか一覧で確認したい。
- メンバーのロールを member から admin に昇格させたい。
- 退会したメンバーを家族グループから削除したい。
- パートナーがパスワードを忘れてログインできなくなった。代わりに仮パスワードを発行して伝えたい。

## 機能要件

### FF1: 家族名の表示・編集

- 現在の家族名を表示する。
- admin ユーザーは編集アイコンをタップしてインライン編集またはダイアログで名前を変更できる。
- 空文字は不可（バリデーション）。
- 変更後は即座に反映し、成功トースト通知を表示する。

### FF2: 招待コードの表示・コピー

- 招待コード（文字列）をマスクせずに表示する。
- 「コピー」ボタンをタップするとクリップボードにコピーされる。
- コピー後はボタンラベルを一時的に「コピー済み ✓」に変える。
- 全員（admin / member）がコードを閲覧・コピーできる。

### FF3: 招待コードの再生成

- admin ユーザーのみ表示される「再生成」ボタン。
- タップ時に確認ダイアログを表示する（「既存のコードは無効になります」）。
- 確認後に新しいコードを生成して即時表示する。

### FF4: メンバー一覧の表示

- 現在の家族メンバーを一覧表示する。
- 各メンバーに表示する情報:
    - ユーザー名
    - ロール（`admin` / `member` / `viewer`）バッジ
    - 参加日（`joined_at`、`YYYY/MM/DD` 形式）
- 全員（admin / member / viewer）が閲覧できる。

### FF7: 権限管理ページへの導線

- Admin ユーザーのみ表示される「権限管理」リンクをメンバー一覧の上部に表示する。
- タップで `/settings/permissions` に遷移する。
- メンバーリストと権限管理を分離することで、ページが肥大化しない構成とする。

### FF5: メンバーのロール変更

- admin ユーザーのみ操作可能。
- 各メンバー行に「ロール変更」ボタンを表示（ただし自分自身には非表示）。
- タップするとダイアログが開き、`admin` / `member` を選択して確認する。
- 最後の admin を member に降格しようとした場合はエラーを返す（少なくとも 1 名の admin が必要）。

### FF6: メンバーの削除

- admin ユーザーのみ操作可能。
- 各メンバー行に「削除」ボタンを表示（ただし自分自身には非表示）。
- タップするとセーフガード付き確認ダイアログを表示する。
- 削除後はメンバー一覧から即時除去する。

### FF8: メンバーのパスワード再発行

- admin ユーザーのみ操作可能。
- 対象: 自分自身を除く全メンバー（member / viewer / admin 問わず）。
- 各メンバー行に「パスワード再発行」ボタンを表示（ただし自分自身には非表示）。
- タップすると確認ダイアログを表示する（「{表示名} のパスワードを再発行しますか？」）。
- 確認後、バックエンドで 12 文字のランダム仮パスワードを生成してハッシュ化して保存する。
- 生成した仮パスワードを結果ダイアログに 1 度だけ表示する（コピーボタン付き）。
- 結果ダイアログには「この画面を閉じると確認できなくなります。本人に安全な方法で伝えてください。」と警告を表示する。
- admin は仮パスワードを本人に伝える責任を負う（アプリ外での連絡を前提とする）。

#### パスワード再発行フロー

```
1. admin がメンバー行の「パスワード再発行」をタップ
2. 確認ダイアログ:「{表示名} のパスワードを再発行しますか？元のパスワードは無効になります」
3. 「再発行する」をタップ → POST /api/family/members/{user_id}/reset-password
4. 結果ダイアログ（仮パスワード表示）:
   ┌──────────────────────────────────┐
   │ 🔑 仮パスワードが発行されました  │
   │ ──────────────────────────────── │
   │  Xk9mP2vLqR5n          [コピー]  │
   │                                  │
   │ ⚠️ この画面を閉じると確認できなく │
   │    なります。本人に安全な方法で  │
   │    伝えてください。              │
   │                        [閉じる]  │
   └──────────────────────────────────┘
5. admin がメンバーに仮パスワードを伝える
6. メンバーが仮パスワードでログイン後、プロフィール設定でパスワードを変更する
```

## 画面構成案

```
┌─────────────────────────────────────┐
│ ← 戻る    家族設定                 │  ← sticky header h-14
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  👨‍👩‍👧 家族名                           │
│  田中家                      [編集]  │  ← admin のみ編集ボタン表示
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🔑 招待コード                       │
│  ┌─────────────────────┐ [コピー]   │
│  │  ABC-1234-XYZ        │           │
│  └─────────────────────┘           │
│                        [再生成]     │  ← admin のみ表示
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  👥 メンバー (3名)       [権限管理] │  ← admin のみ表示（→ /settings/permissions）
│  ─────────────────────────────────  │
│  田中 太郎    [admin]  2024/01/01   │
│                                     │  ← 自分自身: ボタンなし
│  田中 花子    [member] 2024/02/15   │
│   [ロール変更] [削除] [PW再発行]   │  ← admin のみボタン表示
│                                     │
│  山田 次郎    [viewer] 2024/03/10   │
│   [ロール変更] [削除] [PW再発行]   │
└─────────────────────────────────────┘
```

## 技術設計

### コンポーネント構成

```
frontend/app/(dashboard)/settings/family/page.tsx   ← 新規作成
frontend/components/settings/
  FamilyNameForm.tsx      ← 家族名表示・編集（インライン or ダイアログ）
  InviteCodeCard.tsx      ← 招待コード表示・コピー・再生成
  MemberList.tsx          ← メンバー一覧テーブル
  MemberRoleDialog.tsx    ← ロール変更確認ダイアログ
```

#### データ取得フック

```typescript
// SWR を使用
useFamilySettings()    // GET /api/family/ → 家族名・招待コード
useFamilyMembers()     // GET /api/family/members → メンバー一覧
```

#### 状態管理

- ダイアログの開閉は `useState` でローカル管理。
- 家族情報・メンバー情報は SWR でキャッシュ管理し、mutate で更新。

### API エンドポイント

| メソッド | エンドポイント | 実装状況 | 用途 |
|---------|--------------|---------|------|
| GET | `/api/family/` | ✅ 実装済み | 家族名・招待コード取得 |
| PATCH | `/api/family/` | ✅ 実装済み | 家族名更新 |
| POST | `/api/family/invite_code/regenerate` | ✅ 実装済み | 招待コード再生成 |
| GET | `/api/family/members` | ✅ 実装済み | メンバー一覧取得 |
| PATCH | `/api/family/members/{user_id}/role` | ✅ 実装済み | ロール変更 |
| DELETE | `/api/family/members/{user_id}` | ✅ 実装済み | メンバー削除 |
| POST | `/api/family/members/{user_id}/reset-password` | ✅ 実装済み | パスワード再発行（admin 専用） |

#### 新規スキーマ（追加が必要）

```python
# app/schemas/family.py に追加

class FamilyUpdate(BaseModel):
    name: str

class FamilyMemberResponse(BaseModel):
    user_id: int
    username: str
    role: str  # "admin" | "member"
    joined_at: datetime

    class Config:
        from_attributes = True

class MemberRoleUpdate(BaseModel):
    role: str  # "admin" | "member"

class PasswordResetResponse(BaseModel):
    temporary_password: str  # バックエンドが生成した平文仮パスワード（1度だけ返す）
```

#### `POST /api/family/members/{user_id}/reset-password` 設計

```python
@router.post("/members/{user_id}/reset-password", response_model=PasswordResetResponse)
def reset_member_password(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. 呼び出し元が admin であることを確認
    # 2. 対象ユーザーが同じ家族に属することを確認
    # 3. 自分自身を対象にできないことを確認
    # 4. secrets.token_urlsafe(9) などで 12 文字の仮パスワードを生成
    # 5. bcrypt でハッシュ化して User.hashed_password を更新
    # 6. 平文仮パスワードをレスポンスで返す（DBには保存しない）
```

- **セキュリティ注意点**: 仮パスワードはレスポンスで 1 度だけ返す。DBには平文を保存しない。
- HTTPS 通信前提（Cookie と同様）。

#### エラーハンドリング

- 家族名が空文字: フロントエンドバリデーションで弾く（zod）。
- 最後の admin 降格: バックエンドが 400 を返す → トースト表示。
- 自分自身の削除: フロントエンドで非表示（ボタン非表示）。

## 権限制御

| 操作 | admin | member | viewer |
|------|-------|--------|--------|
| 家族名の閲覧 | ✅ | ✅ | ✅ |
| 家族名の編集 | ✅ | ❌（編集ボタン非表示） | ❌ |
| 招待コードの閲覧・コピー | ✅ | ✅ | ✅ |
| 招待コードの再生成 | ✅ | ❌（ボタン非表示） | ❌ |
| メンバー一覧の閲覧 | ✅ | ✅ | ✅ |
| メンバーのロール変更 | ✅（自分自身を除く） | ❌（ボタン非表示） | ❌ |
| メンバーの削除 | ✅（自分自身を除く） | ❌（ボタン非表示） | ❌ |
| メンバーのパスワード再発行 | ✅（自分自身を除く） | ❌（ボタン非表示） | ❌ |
| 権限管理ページへの遷移 | ✅（リンク表示） | ❌（リンク非表示） | ❌ |

権限チェックはフロントエンドの UI 制御（ボタン非表示）とバックエンドの両方で実施する。
バックエンドは `get_current_user()` および `FamilyUser.role` を参照して検証する。

## 実装チェックリスト

### バックエンド

- [x] `PATCH /api/family/` エンドポイント実装（家族名更新）
- [x] `POST /api/family/invite_code/regenerate` エンドポイント実装
- [x] `GET /api/family/members` エンドポイント実装
- [x] `PATCH /api/family/members/{user_id}/role` エンドポイント実装
- [x] `DELETE /api/family/members/{user_id}` エンドポイント実装
- [x] `POST /api/family/members/{user_id}/reset-password` エンドポイント実装
    - [x] admin ロールガード（呼び出し元が admin であることを確認）
    - [x] 自分自身への操作を禁止するガード
    - [x] 同一家族メンバーであることの確認
    - [x] `secrets.token_urlsafe` 等で仮パスワード生成（12文字以上）
    - [x] bcrypt でハッシュ化して `User.hashed_password` を更新
    - [x] 平文パスワードをレスポンスで返す（DBには保存しない）
- [x] 最後の admin 降格をガードするバリデーション
- [x] 各エンドポイントに admin ロールガード追加
- [x] `FamilyUpdate`, `FamilyMemberResponse`, `MemberRoleUpdate` スキーマ追加
- [x] `PasswordResetResponse` スキーマ追加

### フロントエンド

- [x] `frontend/app/(dashboard)/settings/family/page.tsx` 作成
- [x] `FamilyNameForm.tsx` 作成（表示・インライン編集）
- [x] `InviteCodeCard.tsx` 作成（表示・コピー・再生成）
- [x] `MemberList.tsx` 作成（一覧テーブル）
- [x] `MemberRoleDialog.tsx` 作成（ロール変更ダイアログ）
- [x] `MemberPasswordResetDialog.tsx` 作成（パスワード再発行フロー）
    - [x] 確認ダイアログ（「{表示名} のパスワードを再発行しますか？」）
    - [x] 結果ダイアログ（仮パスワード表示 + コピーボタン + 警告メッセージ）
    - [x] `POST /api/family/members/{user_id}/reset-password` 呼び出し
- [x] `MemberList.tsx` に「パスワード再発行」ボタン追加（admin かつ自分自身でない行のみ）
- [x] `useFamilySettings` SWR フック作成
- [x] `useFamilyMembers` SWR フック作成
- [x] ダッシュボードヘッダーに Settings アイコン追加 → `/settings/family` へのリンク
- [x] `cd frontend && pnpm build` でビルド確認

### ナビゲーション

- [x] ダッシュボードヘッダーに ⚙️ Settings アイコンを追加
- [x] `/settings/family` ページヘッダーに「← ダッシュボードへ」戻るボタンを実装
- [ ] メンバー一覧ヘッダーに「権限管理」リンクを追加（admin のみ表示 → `/settings/permissions`）
