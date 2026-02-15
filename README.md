# Baby App

Baby App は、家族単位で赤ちゃんの育児記録を共同管理する Web アプリケーションです。  
授乳・睡眠・おむつ・成長・陣痛・スケジュールを一元管理し、招待制でセキュアに共有できます。

## 主な機能

- 家族作成・招待コード参加
- Cookie セッション認証（ログイン / ログアウト / 現在ユーザー取得）
- 赤ちゃん管理（一覧・作成）
- 記録管理
    - 授乳
    - 睡眠
    - おむつ
    - 成長
    - 陣痛
    - スケジュール
- ダッシュボード表示（フロントエンド）

## 技術スタック

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, SWR
- Backend: FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic
- Database: PostgreSQL（ローカル / Neon）
- Deployment: Docker（Single Service）, Render

## アーキテクチャ

- `frontend` を `next build` で静的出力（`frontend/out`）
- FastAPI が `/api/*` を提供しつつ、`frontend/out` を静的配信
- Docker のマルチステージビルドで 1 コンテナに統合

## ディレクトリ構成

```text
baby-app/
├── app/                   # FastAPI バックエンド
├── frontend/              # Next.js フロントエンド
├── alembic/               # DB マイグレーション
├── tests/                 # テスト
└── .specify/specs/        # 仕様書（SDD）
```

## セットアップ

### 1. 前提

- Python 3.10+
- Node.js 20+
- PostgreSQL

### 2. 環境変数

`.env.example` を元に `.env` を作成します。

```bash
cp .env.example .env
```

主な環境変数:

- `DATABASE_URL`（必須）
- `CORS_ORIGINS`（任意。例: `http://localhost:3000,http://localhost:8000`）
- `COOKIE_SECURE`（任意。デフォルトは `true`。ローカル開発で HTTP を使用する場合は `false` に設定してください）

### 3. Backend セットアップ

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
```

### 4. Frontend セットアップ

```bash
cd frontend
npm install
```

## 開発コマンド

### Backend 起動

```bash
uvicorn app.main:app --reload
```

### Frontend 起動（別ターミナル）

```bash
cd frontend
npm run dev
```

### マイグレーション

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### フロントエンド検証

```bash
cd frontend
npm run lint
npm run test
npm run build
```

## Single Service 動作確認

FastAPI がフロントエンド静的ファイルを配信する構成です。  
まずフロントエンドをビルドし、その後 FastAPI を起動します。

```bash
cd frontend
npm run build
cd ..
uvicorn app.main:app --reload
```

起動後:

- API: `http://localhost:8000/api/*`
- Health Check: `http://localhost:8000/api/health`
- Swagger UI: `http://localhost:8000/docs`

## 主要 API（抜粋）

- Auth: `/api/auth/*`
    - `POST /register/family`
    - `POST /register/join`
    - `POST /login`
    - `POST /logout`
    - `GET /me`
- Family: `GET /api/family/`
- Babies: `GET/POST /api/babies/`, `GET/POST /api/babies/{baby_id}/records`
- Records
    - Feedings: `GET/POST/DELETE /api/feedings/*`
    - Sleeps: `GET/POST/PATCH/DELETE /api/sleeps/*`
    - Diapers: `GET/POST/DELETE /api/diapers/*`
    - Growths: `GET/POST/DELETE /api/growths/*`
    - Contractions: `GET/POST/DELETE /api/contractions/*`
    - Schedules: `GET/POST/DELETE /api/schedules/*`

## デプロイ

- `Dockerfile`: フロントエンドビルド + FastAPI 実行
- `render.yaml`: Render Web Service 設定（`DATABASE_URL` は Dashboard 側で設定）

## 仕様書

仕様駆動で開発します。詳細は以下を参照:

- `.specify/specs/system_design.md`
- `.specify/specs/dashboard.md`
- `.specify/specs/*_tracker.md`
