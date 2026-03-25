# 家系図（Family Tree）機能 仕様書

## 概要

赤ちゃんの血縁関係（親族）を登録・可視化する機能。父方・母方の祖父母、両親、兄弟姉妹、叔父叔母を家系図として表示する。各人物はアプリに登録済みのユーザーと紐付け可能。

## ユーザーストーリー

- Admin/Member として、赤ちゃんの家系図に親族を登録したい（続柄・名前・任意でメモ）
- 祖父母や叔父叔母もアプリユーザーと紐付けたい
- 家系図をビジュアルで確認したい（3世代ツリー表示）
- Viewer として、家系図を閲覧したい（編集不可）

## データモデル

### Relative（親族）テーブル

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | Integer | PK | - |
| `baby_id` | Integer FK(babies) | ✓ | ON DELETE CASCADE |
| `name` | String(100) | ✓ | 表示名 |
| `relationship_type` | String | ✓ | 続柄（下記） |
| `user_id` | Integer FK(users) | - | アプリユーザー紐付け（nullable） |
| `notes` | String(500) | - | メモ |
| `created_at` | DateTime(tz) | ✓ | - |
| `is_deleted` | Boolean | ✓ | ソフトデリート（default: false） |

### relationship_type 有効値

| 値 | 日本語 | 備考 |
|---|---|---|
| `father` | 父 | |
| `mother` | 母 | |
| `paternal_grandfather` | 父方祖父 | |
| `paternal_grandmother` | 父方祖母 | |
| `maternal_grandfather` | 母方祖父 | |
| `maternal_grandmother` | 母方祖母 | |
| `paternal_uncle` | 父方叔父 | |
| `paternal_aunt` | 父方叔母 | |
| `maternal_uncle` | 母方叔父 | |
| `maternal_aunt` | 母方叔母 | |
| `older_brother` | 兄 | 複数登録可 |
| `older_sister` | 姉 | 複数登録可 |
| `younger_brother` | 弟 | 複数登録可 |
| `younger_sister` | 妹 | 複数登録可 |

兄弟姉妹は複数登録可。それ以外は同一 `(baby_id, relationship_type)` の組み合わせを1件に制限しない（アプリ側で制御）。

## API 仕様

### GET /api/babies/{baby_id}/relatives
- **認可**: 家族メンバー（verify_baby_access、record_type="baby"）
- **レスポンス**: `RelativeResponse[]`（relationship_type 順ソート）

### POST /api/babies/{baby_id}/relatives
- **認可**: Admin/Member（require_write=True）
- **リクエスト**: `RelativeCreate`
- **バリデーション**: `relationship_type` が有効値であること、`name` が1〜100文字
- **レスポンス**: `RelativeResponse`

### PATCH /api/babies/{baby_id}/relatives/{relative_id}
- **認可**: Admin/Member（require_write=True）
- **リクエスト**: `RelativeUpdate`（全フィールドオプション）
- **レスポンス**: `RelativeResponse`

### DELETE /api/babies/{baby_id}/relatives/{relative_id}
- **認可**: Admin/Member（require_write=True）
- **動作**: ソフトデリート（`is_deleted = True`）
- **レスポンス**: `{"message": "Deleted"}`

### RelativeResponse スキーマ

```json
{
  "id": 1,
  "baby_id": 1,
  "name": "田中太郎",
  "relationship_type": "father",
  "user_id": 2,
  "user_display_name": "パパ",
  "notes": null,
  "created_at": "2026-01-01T00:00:00Z"
}
```

## UI 仕様

### ページ: `/family-tree`

- ナビゲーション: 全状態（prenatal/postnatal）で表示
- 赤ちゃん切り替えに対応

### 家系図ビジュアル（CSS Grid、外部ライブラリ不要）

3段構成：

```
[父方祖父] [父方祖母]    [母方祖父] [母方祖母]
  [父方叔父/叔母] [父] ─── [母] [母方叔父/叔母]
         [兄/姉] ─── [赤ちゃん★] ─── [弟/妹]
```

- 各人物カード: 名前・続柄ラベル・ユーザー紐付きアイコン（紐付き時はアバター表示）
- 未登録ノード: 「+ 追加」プレースホルダー（Admin/Memberのみ表示）
- カードクリック → RelativeFormDialog（編集/削除）
- プレースホルダークリック → RelativeFormDialog（新規追加、続柄プリセット）

### RelativeFormDialog

- フィールド: 名前（必須）、続柄（続柄が未確定時のみ表示）、アプリユーザー連携（ドロップダウン、任意）、メモ（任意）
- アプリユーザー連携: `GET /api/family/members` の全メンバーから選択可（「紐付けなし」含む）
- 削除ボタン: 確認なしでソフトデリート（既存レコードのみ表示）

## 権限制御

| 操作 | Admin | Member | Viewer |
|---|---|---|---|
| 閲覧 | ✅ | ✅ | ✅ |
| 追加・編集・削除 | ✅ | ✅ | ❌ |

## 受け入れ条件（AC）

1. 有効な続柄で親族を登録できる
2. 無効な続柄（`alien` 等）は 422 エラーになる
3. 兄弟姉妹は同じ続柄で複数登録できる
4. 登録した親族はアプリユーザー（家族メンバー）と紐付けられる
5. 紐付けたユーザーの表示名が `user_display_name` に入る
6. 削除後は一覧に表示されない（ソフトデリート）
7. 別の家族の赤ちゃんに対しては 403 が返る
8. 未認証アクセスは 401 が返る
9. Viewer は追加・編集・削除できない（403）
10. 家系図ページが `/family-tree` で表示される
