# 育児日誌 画像アップロード機能 仕様書

## 概要

育児日誌（DailySummary）に写真を添付・閲覧できる機能。
Cloudflare R2 をストレージとして使用し、**バックエンド経由アップロード方式**を採用する。

---

## 背景・設計方針

- 育児の思い出写真を日誌と紐づけて残したいというニーズに応える。
- フロントエンドが圧縮した画像を FastAPI に送信し、FastAPI が boto3 で R2 にアップロードする。
  - クライアント直接アップロード（Presigned URL）方式はブラウザの CORS 制約を受けるため不採用。
- ブラウザ側で WebP 変換・リサイズ（最大 0.8MB・1200px）を行い、ストレージコストと表示速度を最適化する。
- 既存の `DailySummary` モデルに `image_urls` カラムを追加し、最小限の変更で機能を統合する。
- 既存の権限システム（`verify_baby_access`）をそのまま利用する。

---

## ユーザーストーリー

- **思い出の写真を日誌と一緒に残したい**
  - ユーザーは、日誌を編集する際に写真を添付し、後から日誌と一緒に写真を見返したい。
  - **Acceptance Criteria**: 日誌編集ダイアログから写真を1枚以上選択でき、保存後に日誌カードに写真が表示されること。

- **既存の写真を削除したい**
  - ユーザーは、日誌に添付した写真を個別に削除できる。
  - **Acceptance Criteria**: 日誌編集ダイアログで添付写真の削除ボタンを押すと、保存後にその写真が消えること。

- **権限のないメンバーは写真をアップロードできない**
  - Viewer ロールのユーザーは写真の閲覧のみ可能で、アップロード・削除はできない。
  - **Acceptance Criteria**: `canWrite=false` の場合、アップロード UI が非表示になること。

---

## アーキテクチャ

```
[ユーザー選択]
     ↓
[ブラウザ] browser-image-compression で圧縮・WebP 変換
     ↓
POST /api/upload/image  (multipart/form-data でファイルを送信)
     ↓
[バックエンド] boto3 の put_object で R2 に直接アップロード → public_url を返却
     ↓
PATCH /api/babies/{baby_id}/daily-summary/{summary_date}
  (image_urls に public_url を追加して保存)
```

---

## データベース設計

### `daily_summaries` テーブルへのカラム追加

```python
# app/models/ai_summary.py

# 追加カラム
image_urls = Column(JSON, nullable=True, default=[])
# 例: ["https://pub-xxx.r2.dev/uuid1.webp", "https://pub-xxx.r2.dev/uuid2.webp"]
```

### Alembic マイグレーション

```python
# alembic/versions/cb613dbc3cf8_add_image_urls_to_daily_summaries.py

def upgrade() -> None:
    op.add_column(
        'daily_summaries',
        sa.Column('image_urls', sa.JSON(), nullable=True, server_default='[]'),
    )

def downgrade() -> None:
    op.drop_column('daily_summaries', 'image_urls')
```

---

## バックエンド仕様

### 環境変数（`.env` に追加）

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID="<ACCOUNT_ID>"
R2_ACCESS_KEY_ID="<ACCESS_KEY_ID>"
R2_SECRET_ACCESS_KEY="<SECRET_ACCESS_KEY>"
R2_BUCKET_NAME="baby-app-images"
R2_PUBLIC_ENDPOINT="https://pub-xxxxxxxx.r2.dev"
```

### 新規パッケージ

```txt
# requirements.txt に追加
boto3>=1.34.0
```

### 新規ルーター: `app/routers/upload.py`

**エンドポイント: `POST /api/upload/image`**

- **認証**: `get_current_user()` による認証必須（`Depends`）
- **Request**: `multipart/form-data`（`UploadFile`）
- **処理ロジック**:
  1. `content_type` が `image/` で始まることを検証（それ以外は `400`）
  2. ファイル内容を全て読み込み、5MB 超なら `400`
  3. ファイル拡張子を元のファイル名から抽出（なければ `.webp`）
  4. `{uuid4}.{ext}` でオブジェクトキーを生成
  5. boto3 クライアントを初期化
     - `endpoint_url`: `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
     - `region_name`: `"auto"`
  6. `client.put_object()` でバイト列を R2 に直接アップロード
  7. `public_url` は `{R2_PUBLIC_ENDPOINT}/{object_key}` で構築

- **Response Body**:

```python
class UploadResponse(BaseModel):
    public_url: str   # 公開アクセス用URL
    filename: str     # 生成されたオブジェクトキー（uuid.webp など）
```

- **エラー**:
  - `400`: 画像ファイルでない、またはファイルサイズ超過
  - `503`: R2 環境変数が未設定
  - `500`: R2 アップロード失敗（エラーコード付きでログ出力）

### 既存スキーマの更新: `app/schemas/ai_summary.py`

```python
# DailySummaryEdit に image_urls を追加
class DailySummaryEdit(BaseModel):
    edited_content: Optional[str] = None
    image_urls: Optional[list[str]] = None  # None = 変更なし

# DailySummaryResponse に image_urls を追加
class DailySummaryResponse(BaseModel):
    # ... 既存フィールド
    image_urls: list[str] = []
```

### 既存ルーターの更新: `app/routers/ai_summary.py`

**`PATCH /api/babies/{baby_id}/daily-summary/{summary_date}`** に追加:

```python
if body.image_urls is not None:
    summary.image_urls = body.image_urls
```

### `app/main.py` へのルーター登録

```python
from app.routers import upload
app.include_router(upload.router)
```

---

## フロントエンド仕様

### 新規パッケージ

```bash
cd frontend && pnpm add browser-image-compression
```

### 型定義の更新: `frontend/types/dailySummary.ts`

```typescript
export interface DailySummary {
    // ... 既存フィールド
    image_urls: string[]
}

export interface DailySummaryEdit {
    edited_content: string | null
    image_urls: string[]
}
```

### 画像圧縮ユーティリティ: `frontend/lib/imageCompression.ts`（新規）

```typescript
import imageCompression from "browser-image-compression"

export class ImageTooLargeError extends Error { ... }

export async function compressImage(file: File): Promise<File> {
    // maxSizeMB: 0.8, maxWidthOrHeight: 1200, fileType: "image/webp"
}
```

### アップロードユーティリティ: `frontend/lib/uploadImage.ts`（新規）

```typescript
export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(`${API_BASE}/upload/image`, {
        method: "POST",
        credentials: "include",
        body: formData,  // Content-Type は自動設定（multipart/form-data）
    })
    // ...
    return public_url
}
```

### `frontend/components/diary/DiaryEditDialog.tsx` の更新

- `pendingImages: string[]` 状態でアップロード済みURLを管理
- `isUploading: boolean` 状態でアップロード中制御
- ダイアログ表示時に `summary.image_urls` で初期化
- `canWrite=true` の場合のみ「写真を追加」ボタンを表示（最大 10 枚）
- 各サムネイルに × ボタン（削除は `pendingImages` からの除去のみ）
- アップロード中・保存中は保存ボタンを `disabled`
- `onSave(summaryDate, editedContent, imageUrls)` のシグネチャで呼び出し

### `frontend/components/diary/DiarySummaryCard.tsx` の更新

- `summary.image_urls.length > 0` の場合にサムネイルグリッド（横スクロール）を表示
- タップで shadcn/ui `Dialog` を使った Lightbox 表示（追加ライブラリなし）
- `next/image` を使用（`unoptimized: true` を `next.config.ts` に設定済み）

### `frontend/hooks/useDailySummary.ts` の更新

```typescript
export async function editDailySummary(
    babyId: number,
    summaryDate: string,
    editedContent: string | null,
    imageUrls: string[]   // 追加
): Promise<DailySummary>
```

---

## インフラ設定（Cloudflare R2）

### バケット設定

- バケット名: `baby-app-images`
- パブリックアクセス: 有効（`r2.dev` サブドメインを使用）
- CORS 設定: バックエンド経由アップロードのため**不要**（画像表示用に GET を許可する場合のみ設定）

### 環境変数（Render）

```
R2_ACCOUNT_ID=<ACCOUNT_ID>
R2_ACCESS_KEY_ID=<ACCESS_KEY_ID>      ← 値が途中で切れていないか要確認
R2_SECRET_ACCESS_KEY=<SECRET_ACCESS_KEY>
R2_BUCKET_NAME=baby-app-images
R2_PUBLIC_ENDPOINT=https://pub-xxxxxxxx.r2.dev
```

---

## エラーハンドリング要件

| ケース | 対応 |
|--------|------|
| 非画像ファイルを選択 | `"画像ファイルを選択してください"` を表示 |
| 圧縮後 5MB 超 | `"ファイルサイズが大きすぎます（上限 5MB）"` を表示 |
| アップロード失敗 | `"写真のアップロードに失敗しました: <detail>"` を表示 |
| DB 保存失敗 | `"保存に失敗しました"` を表示（画像は R2 に残るが日誌には反映されない） |

---

## 制約・注意事項

- **画像の物理削除は実装しない（初期バージョン）**: R2 上のオブジェクトは削除しない。`image_urls` から URL を除くだけ。孤立オブジェクトは R2 のライフサイクルルールで別途対応予定。
- **最大枚数制限**: 1日誌あたり最大 10 枚。フロントエンド側で制御。
- **本番 DB マイグレーション**: `alembic upgrade head` は develop ブランチに対してのみ実行。production ブランチへの適用は Render のデプロイ時に自動実行される設定が必要（または手動実行）。

---

## 関連ファイル（変更・新規作成一覧）

| ファイル | 変更種別 |
|---------|---------|
| `app/models/ai_summary.py` | 変更（`image_urls` カラム追加） |
| `app/schemas/ai_summary.py` | 変更（`image_urls` フィールド追加） |
| `app/routers/upload.py` | **新規作成**（`POST /api/upload/image`） |
| `app/routers/ai_summary.py` | 変更（PATCH 処理に `image_urls` 対応追加） |
| `app/main.py` | 変更（`upload` ルーター登録） |
| `requirements.txt` | 変更（`boto3` 追加） |
| `alembic/versions/cb613dbc3cf8_add_image_urls_to_daily_summaries.py` | **新規作成** |
| `frontend/types/dailySummary.ts` | 変更（`image_urls` フィールド追加） |
| `frontend/lib/imageCompression.ts` | **新規作成** |
| `frontend/lib/uploadImage.ts` | **新規作成** |
| `frontend/hooks/useDailySummary.ts` | 変更（`editDailySummary` 引数追加） |
| `frontend/components/diary/DiaryEditDialog.tsx` | 変更（画像選択・プレビュー UI 追加） |
| `frontend/components/diary/DiarySummaryCard.tsx` | 変更（画像表示・Lightbox 追加） |
| `frontend/next.config.ts` | 変更（`images.unoptimized: true` 追加） |
| `.env` | 変更（R2 環境変数追加） |
