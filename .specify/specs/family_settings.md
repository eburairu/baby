# 家族管理画面 仕様書 (Family Settings Specification)

## 概要

Baby-App の家族設定画面（`/settings/family`）の仕様。
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
    - ロール（`admin` / `member`）バッジ
    - 参加日（`joined_at`、`YYYY/MM/DD` 形式）
- 全員（admin / member）が閲覧できる。

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
│  👥 メンバー (3名)                   │
│  ─────────────────────────────────  │
│  田中 太郎    [admin]  2024/01/01   │
│                                     │  ← 自分自身: ボタンなし
│  田中 花子    [member] 2024/02/15   │
│              [ロール変更] [削除]    │  ← admin のみボタン表示
│                                     │
│  山田 次郎    [member] 2024/03/10   │
│              [ロール変更] [削除]    │
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
```

#### エラーハンドリング

- 家族名が空文字: フロントエンドバリデーションで弾く（zod）。
- 最後の admin 降格: バックエンドが 400 を返す → トースト表示。
- 自分自身の削除: フロントエンドで非表示（ボタン非表示）。

## 権限制御

| 操作 | admin | member |
|------|-------|--------|
| 家族名の閲覧 | ✅ | ✅ |
| 家族名の編集 | ✅ | ❌（編集ボタン非表示） |
| 招待コードの閲覧・コピー | ✅ | ✅ |
| 招待コードの再生成 | ✅ | ❌（ボタン非表示） |
| メンバー一覧の閲覧 | ✅ | ✅ |
| メンバーのロール変更 | ✅（自分自身を除く） | ❌（ボタン非表示） |
| メンバーの削除 | ✅（自分自身を除く） | ❌（ボタン非表示） |

権限チェックはフロントエンドの UI 制御（ボタン非表示）とバックエンドの両方で実施する。
バックエンドは `get_current_user()` および `FamilyUser.role` を参照して検証する。

## 実装チェックリスト

### バックエンド

- [x] `PATCH /api/family/` エンドポイント実装（家族名更新）
- [x] `POST /api/family/invite_code/regenerate` エンドポイント実装
- [x] `GET /api/family/members` エンドポイント実装
- [x] `PATCH /api/family/members/{user_id}/role` エンドポイント実装
- [x] `DELETE /api/family/members/{user_id}` エンドポイント実装
- [x] 最後の admin 降格をガードするバリデーション
- [x] 各エンドポイントに admin ロールガード追加
- [x] `FamilyUpdate`, `FamilyMemberResponse`, `MemberRoleUpdate` スキーマ追加

### フロントエンド

- [x] `frontend/app/(dashboard)/settings/family/page.tsx` 作成
- [x] `FamilyNameForm.tsx` 作成（表示・インライン編集）
- [x] `InviteCodeCard.tsx` 作成（表示・コピー・再生成）
- [x] `MemberList.tsx` 作成（一覧テーブル）
- [x] `MemberRoleDialog.tsx` 作成（ロール変更ダイアログ）
- [x] `useFamilySettings` SWR フック作成
- [x] `useFamilyMembers` SWR フック作成
- [x] ダッシュボードヘッダーに Settings アイコン追加 → `/settings/family` へのリンク
- [x] `npm run build` でビルド確認

### ナビゲーション

- [x] ダッシュボードヘッダーに ⚙️ Settings アイコンを追加
- [x] `/settings/family` ページヘッダーに「← ダッシュボードへ」戻るボタンを実装
