# 育児日誌 画像アップロード機能 仕様書

## 概要

育児日誌（DailySummary）に写真を添付・閲覧できる機能を実装する。
Cloudflare R2 を使用した署名付きURL（Presigned URL）によるクライアント直接アップロード方式を採用し、サーバー負荷を最小化する。

---

## 背景・設計方針

- 育児の思い出写真を日誌と紐づけて残したいというニーズに応える。
- バックエンドを経由せずクライアントから R2 へ直接アップロードし、通信コストを削減する。
- ブラウザ側で圧縮（WebP 変換・リサイズ）を行い、ストレージコストと表示速度を最適化する。
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
  - **Acceptance Criteria**: `canWrite=false` の場合、アップロードUI が非表示になること。

---

## アーキテクチャ

```
[ユーザー選択]
     ↓
[ブラウザ] browser-image-compression で圧縮・WebP 変換
     ↓
POST /api/upload/presigned  (ファイル名・content_type を送信)
     ↓
[バックエンド] boto3 で R2 に署名付きURL を発行 → upload_url, public_url を返却
     ↓
[ブラウザ] upload_url へ PUT リクエスト（画像データを直接送信）
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
image_urls = Column(JSON, default=[], nullable=True)
# 例: ["https://pub-xxx.r2.dev/uuid1.webp", "https://pub-xxx.r2.dev/uuid2.webp"]
```

### Alembic マイグレーション

```python
# alembic/versions/xxxx_add_image_urls_to_daily_summaries.py

def upgrade() -> None:
    op.add_column(
        "daily_summaries",
        sa.Column("image_urls", sa.JSON(), nullable=True, server_default="[]"),
    )

def downgrade() -> None:
    op.drop_column("daily_summaries", "image_urls")
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

**エンドポイント: `POST /api/upload/presigned`**

- **認証**: `get_current_user()` による認証必須（`Depends`）
- **Request Body**:

```python
class PresignedUrlRequest(BaseModel):
    filename: str      # 例: "baby_smile.jpg"
    content_type: str  # 例: "image/webp"
```

- **処理ロジック**:
  1. `content_type` が `image/` で始まることを検証（それ以外は `400`）
  2. ファイル拡張子を元のファイル名から抽出（なければ `.webp`）
  3. `{uuid4}.{ext}` でオブジェクトキーを生成
  4. boto3 クライアントを初期化
     - `endpoint_url`: `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
     - `aws_access_key_id`: `R2_ACCESS_KEY_ID`
     - `aws_secret_access_key`: `R2_SECRET_ACCESS_KEY`
     - `region_name`: `"auto"`
  5. `generate_presigned_url("put_object", ...)` を実行
     - ExpiresIn: `3600` 秒
     - `ContentType` を Params に含める
  6. `public_url` は `{R2_PUBLIC_ENDPOINT}/{object_key}` で構築

- **Response Body**:

```python
class PresignedUrlResponse(BaseModel):
    upload_url: str   # 署名付きPUT URL（R2エンドポイント）
    public_url: str   # 公開アクセス用URL
    filename: str     # 生成されたオブジェクトキー（uuid.webp など）
```

- **エラー**:
  - `400`: `content_type` が画像でない
  - `500`: R2 API 呼び出し失敗（ログ出力してエラーを返す）

### 既存スキーマの更新: `app/schemas/ai_summary.py`

```python
# DailySummaryEdit に image_urls を追加
class DailySummaryEdit(BaseModel):
    edited_content: Optional[str] = None
    image_urls: Optional[list[str]] = None  # 追加（None = 変更なし）

# DailySummaryResponse に image_urls を追加
class DailySummaryResponse(BaseModel):
    # ... 既存フィールド
    image_urls: list[str] = []  # 追加
```

### 既存ルーターの更新: `app/routers/ai_summary.py`

**`PATCH /api/babies/{baby_id}/daily-summary/{summary_date}`** の処理に `image_urls` 更新を追加:

```python
# 既存の edited_content 更新処理に追加
if edit_data.image_urls is not None:
    summary.image_urls = edit_data.image_urls
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
cd frontend && npm install browser-image-compression
```

### 型定義の更新: `frontend/types/dailySummary.ts`

```typescript
export interface DailySummary {
    // ... 既存フィールド
    image_urls: string[]  // 追加
}
```

### 画像圧縮ユーティリティ: `frontend/lib/imageCompression.ts`（新規）

```typescript
import imageCompression from "browser-image-compression"

export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.85,
    }
    return imageCompression(file, options)
}
```

### アップロードユーティリティ: `frontend/lib/uploadImage.ts`（新規）

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

export async function uploadImage(file: File): Promise<string> {
    // 1. Presigned URL を取得
    const presignedRes = await fetch(`${API_BASE}/api/upload/presigned`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            filename: file.name,
            content_type: file.type,
        }),
    })
    if (!presignedRes.ok) throw new Error("署名付きURLの取得に失敗しました")
    const { upload_url, public_url } = await presignedRes.json()

    // 2. R2 へ直接 PUT
    const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
    })
    if (!putRes.ok) throw new Error("画像のアップロードに失敗しました")

    return public_url
}
```

### 既存コンポーネントの更新: `frontend/components/diary/DiaryEditDialog.tsx`

**追加する UI・ロジック**:

1. **状態**:
   - `pendingImages: string[]` — アップロード済みの公開URL一覧（編集中の状態）
   - `isUploading: boolean` — アップロード中フラグ

2. **ダイアログ開く際の初期化**:
   - `summary.image_urls` の値で `pendingImages` を初期化

3. **画像追加UI**（`canWrite=true` の場合のみ表示）:
   ```tsx
   <input
       type="file"
       accept="image/*"
       multiple
       onChange={handleImageSelect}
   />
   ```
   - `onChange` ハンドラ:
     1. ファイルサイズ検証（圧縮前 20MB 超はエラー）
     2. 画像ファイル以外はエラー
     3. `compressImage()` で圧縮
     4. 圧縮後 5MB 超はエラー
     5. `uploadImage()` で R2 へアップロード
     6. 取得した public_url を `pendingImages` に追加

4. **画像プレビュー表示**:
   - サムネイルグリッド（横スクロール）
   - 各画像に削除ボタン（×）
   - 削除時は `pendingImages` から該当URLを除去

5. **保存処理の更新**:
   - 既存の `onSave(summaryDate, editedContent)` のシグネチャを変更:
     ```typescript
     onSave(summaryDate: string, editedContent: string | null, imageUrls: string[])
     ```
   - 保存時に `image_urls: pendingImages` を PATCH ボディに含める

6. **アップロード中の制御**:
   - `isUploading=true` 中は保存ボタンを `disabled`

### 既存コンポーネントの更新: `frontend/components/diary/DiarySummaryCard.tsx`

1. **画像表示エリアを追加**:
   - `summary.image_urls.length > 0` の場合に表示
   - 横スクロール可能なサムネイルグリッド
   - タップでフルスクリーン表示（lightbox）

2. **Lightbox の実装**:
   - 追加パッケージは使用せず、シンプルに Next.js の `<Image>` で `Dialog` 内に表示
   - shadcn/ui の `Dialog` コンポーネントを利用

### 既存フック: `frontend/hooks/useDailySummary.ts`

**`editDailySummary` の引数を更新**:

```typescript
async function editDailySummary(
    babyId: number,
    date: string,
    editedContent: string | null,
    imageUrls: string[]  // 追加
): Promise<void>
```

---

## インフラ設定（Cloudflare R2）

### バケット作成

- バケット名: `baby-app-images`
- リージョン: APAC（可能であれば）

### CORS ポリシー（バケット設定で適用）

```json
[
    {
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://<YOUR_RENDER_APP_URL>.onrender.com"
        ],
        "AllowedMethods": ["PUT", "GET", "HEAD"],
        "AllowedHeaders": ["Content-Type", "*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

### パブリックアクセス設定

- R2 バケットの「Public Access」を有効化
- または Cloudflare カスタムドメインを設定し `R2_PUBLIC_ENDPOINT` に設定

---

## エラーハンドリング要件

| ケース | 対応 |
|--------|------|
| 非画像ファイルを選択 | `"画像ファイルを選択してください"` をユーザーに表示 |
| 圧縮後 5MB 超 | `"ファイルサイズが大きすぎます（上限5MB）"` を表示 |
| 署名付きURL 取得失敗 | `"アップロードの準備に失敗しました"` を表示 |
| R2 PUT 失敗 | `"写真のアップロードに失敗しました。再度お試しください"` を表示 |
| DB 保存失敗 | `"保存に失敗しました"` を表示（画像は R2 に残るが日誌には反映されない） |

---

## 実装ステップ

### Step 1: インフラ準備

1. Cloudflare R2 でバケット `baby-app-images` を作成
2. R2 API トークンを発行（読み書き権限）
3. パブリックアクセスを有効化（または r2.dev サブドメインを使用）
4. CORS ポリシーを設定
5. `.env` に R2 関連環境変数を追加

### Step 2: バックエンド実装

1. `requirements.txt` に `boto3>=1.34.0` を追加してインストール
2. `app/models/ai_summary.py` に `image_urls` カラムを追加
3. Alembic マイグレーションを生成・適用
4. `app/schemas/ai_summary.py` を更新（`DailySummaryEdit`, `DailySummaryResponse`）
5. `app/routers/upload.py` を新規作成（presigned URL エンドポイント）
6. `app/routers/ai_summary.py` の PATCH エンドポイントを更新（`image_urls` 対応）
7. `app/main.py` に `upload` ルーターを登録

### Step 3: フロントエンド実装

1. `browser-image-compression` をインストール
2. `frontend/types/dailySummary.ts` を更新
3. `frontend/lib/imageCompression.ts` を新規作成
4. `frontend/lib/uploadImage.ts` を新規作成
5. `frontend/hooks/useDailySummary.ts` の `editDailySummary` を更新
6. `frontend/components/diary/DiaryEditDialog.tsx` を更新（画像選択・プレビュー・削除）
7. `frontend/components/diary/DiarySummaryCard.tsx` を更新（画像表示・Lightbox）

### Step 4: 動作確認

1. 画像を選択 → 圧縮 → R2 にアップロードされること
2. 日誌カードに写真が表示されること
3. 写真をタップでフルスクリーン表示されること
4. 編集ダイアログで写真を削除できること
5. Viewer ロールではアップロード UI が表示されないこと

---

## 制約・注意事項

- **画像の物理削除は実装しない（初期バージョン）**: R2 上のオブジェクトは削除しない。`image_urls` からURLを除くだけ。孤立オブジェクトはR2のライフサイクルルールで別途対応予定。
- **最大枚数制限**: 1日誌あたり最大10枚。フロントエンド側で制御。
- **boto3 の初期化コスト**: R2 クライアントはリクエストごとに生成するか、アプリ起動時にシングルトンとして生成する（FastAPI の `lifespan` を使用するか、モジュールレベルで生成）。
- **Render デプロイ**: Render の環境変数に R2 関連変数を追加すること。

---

## 関連ファイル（変更・新規作成一覧）

| ファイル | 変更種別 |
|---------|---------|
| `app/models/ai_summary.py` | 変更（`image_urls` カラム追加） |
| `app/schemas/ai_summary.py` | 変更（`image_urls` フィールド追加） |
| `app/routers/upload.py` | **新規作成** |
| `app/routers/ai_summary.py` | 変更（PATCH 処理に `image_urls` 対応追加） |
| `app/main.py` | 変更（`upload` ルーター登録） |
| `requirements.txt` | 変更（`boto3` 追加） |
| `alembic/versions/xxxx_add_image_urls_to_daily_summaries.py` | **新規作成** |
| `frontend/types/dailySummary.ts` | 変更（`image_urls` フィールド追加） |
| `frontend/lib/imageCompression.ts` | **新規作成** |
| `frontend/lib/uploadImage.ts` | **新規作成** |
| `frontend/hooks/useDailySummary.ts` | 変更（`editDailySummary` 引数追加） |
| `frontend/components/diary/DiaryEditDialog.tsx` | 変更（画像選択・プレビュー UI 追加） |
| `frontend/components/diary/DiarySummaryCard.tsx` | 変更（画像表示・Lightbox 追加） |
| `.env` | 変更（R2 環境変数追加） |
