# ローカル環境動作確認仕様書

## 概要

本ドキュメントは、Botoro のローカル開発環境におけるセットアップおよび動作確認の手順を規定する。

## 前提条件

- Python 3.10 以上（`.python-version` で 3.10.12 を指定）
- Node.js 20 以上
- pnpm（フロントエンドのパッケージマネージャ）
- **Docker 不要** — DB は Neon のブランチを使用する

## セットアップ手順

### 1. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、必要に応じて値を書き換える。

```bash
cp .env.example .env
```

#### 主な環境変数

| 変数名 | 説明 | 備考 |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL 接続文字列 | 必須。Neon ダッシュボードまたは MCP で取得 |
| `TZ` | タイムゾーン | `Asia/Tokyo` |
| `COOKIE_SECURE` | Cookie の Secure 属性 | ローカルでは `false` に設定 |
| `TEST_USER_USERNAME` / `TEST_USER_PASSWORD` | テストユーザー認証情報 | `seed_test_user.py` で使用 |
| `NEXT_PUBLIC_TEST_USER_USERNAME` / `NEXT_PUBLIC_TEST_USER_PASSWORD` | フロントエンド側テストユーザー | ログイン画面で利用 |
| `R2_*` | Cloudflare R2 ストレージ設定 | 画像アップロード機能に必要 |
| `LLM_PROVIDER` / `LLM_API_KEY` / `LLM_MODEL` | AI 日誌生成の LLM 設定 | `google` or `openai` |
| `VAPID_PRIVATE_KEY` / `VAPID_PUBLIC_KEY` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push 通知用 VAPID 鍵 | PWA プッシュ通知に必要 |

※ シェルで `source .env` する場合は値をダブルクォートで囲むこと。

### 2. バックエンドのセットアップ

仮想環境を作成し、依存ライブラリをインストールして、マイグレーションを実行する。

```bash
python -m venv .venv
source .venv/bin/activate
pip install uv
uv pip install -r requirements-dev.txt  # pytest/httpx を含む開発用
set -a && source .env && set +a
alembic upgrade head
```

### 3. テストユーザーの作成（初回のみ）

ローカル環境でログインするためのテストユーザーを作成する。

```bash
python scripts/seed_test_user.py
```

### 4. フロントエンドのセットアップ

```bash
cd frontend
pnpm install
```

> **注意**: `git worktree` 環境を使用する場合のセットアップおよび検証の詳細は [Git Worktree 開発フロー仕様書](./git_worktree_workflow.md) を参照してください。

## DB 環境（Neon ブランチ構成）

| ブランチ名 | 用途 |
|---|---|
| `production` | 本番（Render から参照） |
| `develop` | ローカル開発用 |

接続文字列は Neon ダッシュボードまたは Neon MCP で取得可能。

## 動作確認手順

### 1. 全テストの実行（バックエンド & フロントエンド）

プロジェクト全体のテストを一つのコマンドで実行する。

```bash
npm test
```

### 2. バックエンド・ユニットテストの個別実行

```bash
npm run test:backend
```

### 3. フロントエンド・ユニットテストの個別実行

```bash
npm run test:frontend
```

### 4. フロントエンドのビルド確認

```bash
cd frontend && pnpm build
```

### 5. フロントエンドの Lint 確認

```bash
cd frontend && pnpm lint
```

### 6. OpenAPI スキーマ & 型生成

バックエンドの API スキーマからフロントエンドの TypeScript 型を生成する。

```bash
npm run types:generate
```

### 7. 開発サーバーの起動と動作確認

#### a. バックエンド + フロントエンド（開発モード）

開発時はバックエンドとフロントエンドを別々に起動する。

1. バックエンドサーバーの起動:

   ```bash
   uvicorn app.main:app --reload
   ```

   - API: `http://localhost:8000/api`
   - Swagger UI: `http://localhost:8000/docs`

2. フロントエンド開発サーバーの起動（別ターミナル）:

   ```bash
   cd frontend && pnpm dev
   ```

   - Frontend: `http://localhost:3000`

#### b. 統合動作確認（Single Service 構成）

FastAPI がフロントエンドの静的ビルド（`frontend/out/`）を配信する構成を確認する。

1. フロントエンドをビルド:

   ```bash
   cd frontend && pnpm build
   ```

2. バックエンドサーバーの起動:

   ```bash
   uvicorn app.main:app --reload
   ```

3. 以下を確認:
   - `http://localhost:8000/api/health` → `{"status": "ok"}` が返る
   - `http://localhost:8000/docs` → Swagger UI が表示される
   - `http://localhost:8000/` → トップ画面が表示される

## npm scripts リファレンス

| コマンド | 説明 |
|---|---|
| `npm test` | 全テスト (Backend + Frontend) |
| `npm run test:backend` | Backend only (pytest) |
| `npm run test:frontend` | Frontend only (vitest) |
| `npm run build:frontend` | フロントエンドビルド |
| `npm run start:backend` | バックエンド起動 |
| `npm run migrate` | DB マイグレーション実行 |
| `npm run schema:generate` | OpenAPI スキーマ出力 |
| `npm run types:generate` | スキーマ生成 + TypeScript 型生成 |

## 異常時の対応

- **データベース接続エラー**: `DATABASE_URL` の設定を確認。Neon ダッシュボードでブランチのステータスを確認。
- **マイグレーションエラー**: `alembic upgrade head` が成功しているか確認。
- **フロントエンドビルドエラー**: `frontend/node_modules` を削除して `pnpm install` を再実行。
- **テストユーザーでログインできない**: `python scripts/seed_test_user.py` でテストユーザーが作成済みか確認。
- **画像アップロードエラー**: `.env` の `R2_*` 設定を確認。
- **Push 通知が届かない**: `VAPID_*` および `NEXT_PUBLIC_VAPID_PUBLIC_KEY` の設定を確認。
