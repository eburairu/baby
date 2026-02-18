# Baby App

Baby App は、家族単位で赤ちゃんの育児記録を共同管理する招待制 Web アプリケーションです。
授乳・睡眠・おむつ・成長・陣痛・スケジュールを一元管理し、AI による日誌生成やプッシュ通知など多彩な機能を提供します。

## 主な機能

### 育児記録

- **授乳** — 母乳・ミルク・混合の記録（量・時間）
- **睡眠** — 開始・終了時刻のトラッキング
- **おむつ** — おしっこ・うんち・両方の記録
- **成長** — 身長・体重・頭囲の推移管理
- **ノート** — 自由記述メモ
- **陣痛タイマー** — 間隔・持続時間の自動計算
- **スケジュール** — 予定管理

### 家族管理・認証

- 家族作成（管理者） / 招待コードで参加
- Cookie セッション認証（ログイン / ログアウト / ユーザー情報取得）
- ロールベースのアクセス制御（admin / member / viewer）
- 赤ちゃんごと・記録タイプごとの詳細権限管理

### 付加機能

- **AI 日誌** — OpenAI API 連携によるデイリーサマリー自動生成・手動編集
- **記録へのコメント** — 各記録にコメントを投稿
- **画像アップロード** — Cloudflare R2 連携
- **Web Push 通知** — ブラウザ通知の購読管理と通知設定
- **PWA 対応** — オフラインサポート・インストール可能
- **ダークモード** — システム設定に連動した外観切り替え
- **マルチベビー対応** — 複数の赤ちゃんを切り替えて管理

## 技術スタック

| 分類 | 技術 |
| ---- | ---- |
| Frontend | Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui |
| State / Data | Zustand, SWR, Zod, React Hook Form |
| PWA | @ducanh2912/next-pwa |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic |
| Database | PostgreSQL（Neon Serverless） |
| Storage | Cloudflare R2（画像） |
| AI | OpenAI API（日誌生成） |
| Deployment | Docker マルチステージビルド → Render |

## アーキテクチャ

FastAPI が Next.js の静的ビルド（`frontend/out/`）を StaticFiles でマウントして配信する **シングルサービス構成**。

```
Browser → FastAPI (:8000)
              ├── /api/*      → FastAPI エンドポイント
              └── /*          → frontend/out/ 静的ファイル配信
```

- `next build` による Static Export（`output: 'export'`）
- 全 API は `/api` プレフィックス
- Cookie ベースのセッション管理（HttpOnly）

## ディレクトリ構成

```text
baby-app/
├── app/                   # FastAPI バックエンド
│   ├── main.py            # アプリ起動・ルーター登録
│   ├── models/            # SQLAlchemy モデル
│   ├── routers/           # API エンドポイント
│   ├── schemas/           # Pydantic スキーマ
│   ├── services/          # ビジネスロジック
│   ├── dependencies.py    # 認証・認可依存関係
│   └── database.py        # DB 接続設定
├── frontend/              # Next.js フロントエンド
│   └── app/
│       ├── (auth)/        # 認証ページ（login / register）
│       └── (dashboard)/   # 機能ページ
│           ├── feeding/   # 授乳
│           ├── sleep/     # 睡眠
│           ├── diaper/    # おむつ
│           ├── growth/    # 成長
│           ├── note/      # ノート
│           ├── diary/     # 育児日誌（AI）
│           ├── contraction/ # 陣痛タイマー
│           └── settings/  # 設定（プロフィール・家族・通知）
├── alembic/               # DB マイグレーション
├── tests/                 # テスト（pytest / vitest）
├── .specify/specs/        # 仕様書（SDD）
│   ├── tracking/          #   育児記録機能
│   ├── ai/                #   AI機能
│   ├── settings/          #   設定・管理画面
│   ├── ui/                #   UI/UX・表示
│   ├── auth/              #   認証・権限
│   ├── infrastructure/    #   インフラ・DevOps
│   ├── development/       #   開発プロセス
│   └── social/            #   コミュニケーション
└── verification/          # 動作確認スクリプト
```

## セットアップ

### 前提

- Python 3.10+
- Node.js 20+
- **Docker 不要** — DB は Neon のブランチを使用

### 環境変数

`.env.example` を元に `.env` を作成します。

```bash
cp .env.example .env
```

主な環境変数:

| 変数名 | 必須 | 説明 |
| ------ | ---- | ---- |
| `DATABASE_URL` | ✅ | PostgreSQL 接続文字列（Neon） |
| `CORS_ORIGINS` | — | 許可オリジン（例: `http://localhost:3000`） |
| `COOKIE_SECURE` | — | HTTP 開発時は `false`（デフォルト `true`） |
| `OPENAI_API_KEY` | — | AI 日誌機能に必要 |
| `VAPID_PRIVATE_KEY` | — | Web Push 通知に必要 |
| `CLOUDFLARE_*` | — | 画像アップロードに必要 |

### バックエンドセットアップ

```bash
python -m venv .venv
source .venv/bin/activate
pip install uv
uv pip install -r requirements-dev.txt  # pytest/httpx を含む開発用
alembic upgrade head
```

### フロントエンドセットアップ

```bash
cd frontend
pnpm install
```

## 開発コマンド

### ローカル起動

```bash
# 1. 仮想環境を有効化
source .venv/bin/activate

# 2. 環境変数を読み込む
set -a && source .env && set +a

# 3. バックエンドを起動
uvicorn app.main:app --reload

# 4. フロントエンドを起動（別ターミナル）
cd frontend && pnpm dev
```

起動後:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000/api`
- Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### テスト

```bash
npm test                   # バックエンド + フロントエンド全テスト
npm run test:backend       # pytest のみ
npm run test:frontend      # vitest のみ
```

### マイグレーション

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### フロントエンドビルド確認

```bash
cd frontend
pnpm lint
pnpm build
```

## Single Service 動作確認

```bash
cd frontend && pnpm build && cd ..
uvicorn app.main:app --reload
```

## 主要 API

### 認証 (`/api/auth/`)

| メソッド | パス | 説明 |
| -------- | ---- | ---- |
| `POST` | `/register/family` | 家族作成と管理者登録 |
| `POST` | `/register/join` | 招待コードで参加 |
| `POST` | `/login` | ログイン（Cookie 発行） |
| `POST` | `/logout` | ログアウト |
| `GET` | `/me` | ログイン中のユーザー情報 |
| `PATCH` | `/me` | プロフィール更新 |

### 家族 (`/api/family/`)

| メソッド | パス | 説明 |
| -------- | ---- | ---- |
| `GET` / `PATCH` | `/` | 家族情報の取得・更新 |
| `POST` | `/invite_code/regenerate` | 招待コード再生成 |
| `GET` | `/members` | メンバー一覧 |
| `PATCH` | `/members/{user_id}/role` | ロール変更（管理者のみ） |
| `DELETE` | `/members/{user_id}` | メンバー削除（管理者のみ） |

### 赤ちゃん (`/api/babies/`)

| メソッド | パス | 説明 |
| -------- | ---- | ---- |
| `GET` / `POST` | `/` | 一覧取得・新規登録 |
| `PATCH` / `DELETE` | `/{baby_id}` | 情報更新・削除 |
| `GET` / `POST` | `/{baby_id}/records` | 統合タイムライン取得・記録作成 |
| `GET` / `PUT` | `/{baby_id}/permissions` | 詳細権限管理 |

### 育児記録

- `GET/POST/PATCH/DELETE /api/feedings/*`
- `GET/POST/PATCH/DELETE /api/sleeps/*`
- `GET/POST/DELETE /api/diapers/*`
- `GET/POST/DELETE /api/growths/*`
- `GET/POST/DELETE /api/contractions/*`
- `GET/POST/DELETE /api/schedules/*`
- `GET/POST/DELETE /api/babies/{baby_id}/notes`

### 付加機能

- `GET/POST/PATCH /api/babies/{baby_id}/daily-summary` — AI 日誌
- `GET/POST /api/records/{record_type}/{record_id}/comments` — コメント
- `DELETE /api/comments/{comment_id}` — コメント削除
- `POST /api/upload/image` — 画像アップロード
- `GET/POST/PATCH /api/notifications/*` — Web Push 通知

## データモデル

```
Family
  └── FamilyUser (role: admin / member / viewer)
        └── User
              └── UserSession

Baby (belongs to Family)
  ├── BabyPermission (record_type ごとの can_view)
  ├── Feeding / Sleep / Diaper / Growth
  ├── Contraction / Schedule / Note
  ├── DailySummary (AI 日誌)
  └── RecordComment (各記録へのコメント)
```

## デプロイ

- `Dockerfile` — フロントエンドビルド + FastAPI 実行のマルチステージビルド
- `render.yaml` — Render Web Service 設定（`DATABASE_URL` は Dashboard 側で設定）

仕様駆動（SDD）で開発しています。詳細は `.specify/specs/` 配下を参照:

| カテゴリ | パス | 内容 |
| ---- | ---- | ---- |
| 育児記録 | `tracking/` | 授乳・睡眠・おむつ・成長・陣痛・スケジュール・メモ |
| AI | `ai/` | AI日誌生成・チャットボット |
| 設定 | `settings/` | プロフィール・家族・赤ちゃん・権限管理 |
| UI/UX | `ui/` | デザインシステム・ダッシュボード・ダークモード |
| 認証 | `auth/` | セッション管理・VIEWERロール |
| インフラ | `infrastructure/` | システム設計・PWA・Sentry・リリース |
| 開発 | `development/` | ローカル検証・OpenAPI型生成 |
| ソーシャル | `social/` | コメント・画像アップロード |
