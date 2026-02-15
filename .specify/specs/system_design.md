# システム設計書 (System Design)

Baby-App の全体アーキテクチャと技術スタックを定義します。

## 概要

Baby-App は、家族単位で赤ちゃんの育児記録（授乳、睡眠、おむつ、成長、陣痛、スケジュール）を共同管理するための Web アプリケーションです。
招待制を採用し、セキュアな家族共有環境を提供します。

## アーキテクチャ構成

本アプリケーションは **Next.js (Frontend)** と **FastAPI (Backend)** を組み合わせたシングルサービス構成を採用しています。

### シングルサービスデプロイメント

- **Frontend**: Next.js を使用し、`next build` (Static Export) で静的ファイルとして出力 (`frontend/out`) します。
- **Backend**: FastAPI が API エンドポイント (`/api/*`) を提供すると同時に、Frontend の静的ファイルをルート (`/*`) にマウントして配信します。
- **Deployment**: Docker のマルチステージビルドを利用し、単一のコンテナイメージとして Render にデプロイされます。

## 階層構造 (Data Hierarchy)

1. **Family (家族)**: 管理の最上位単位。名前と招待コードを持つ。
2. **User (ユーザー)**: 家族に属するメンバー。'admin' (管理者) または 'member' (一般) の権限を持つ。
3. **Baby (赤ちゃん)**: 家族に紐付く記録対象。1つの家族に複数の赤ちゃんを登録可能。
4. **Records (記録)**: 各赤ちゃんに紐付く具体的なデータ（授乳、睡眠など）。作成者情報も保持する。

## 技術スタック

### Frontend

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, Lucide React
- **State Management**: Zustand
- **Data Fetching**: SWR
- **Validation**: Zod + React Hook Form
- **PWA**: @ducanh2912/next-pwa (Offline support, Installable)

### Backend

- **Framework**: FastAPI (Python 3.10+)
- **ORM**: SQLAlchemy 2.0
- **Migration**: Alembic
- **Middleware**: CORSMiddleware, CSRFCookieMiddleware
- **Authentication**: Cookie-based Session (HttpOnly, Secure)

### Infrastructure & Database

- **Database**: PostgreSQL (Neon Serverless)
- **Container**: Docker (Multi-stage Build)
- **Deployment**: Render (Web Service)

## ディレクトリ構造

```
baby-app/
├── app/                   # Backend (FastAPI)
│   ├── main.py            # エントリポイント (API + Static File Serving)
│   ├── models/            # SQLAlchemy モデル (User, Family, Baby, etc.)
│   ├── schemas/           # Pydantic スキーマ
│   ├── routers/           # API ルート定義 (/api/*)
│   ├── services/          # ビジネスロジック
│   ├── middleware/        # ミドルウェア (CSRF, CORS)
│   └── dependencies.py    # DI (依存性注入)
├── frontend/              # Frontend (Next.js)
│   ├── app/               # App Router ページ・レイアウト
│   ├── components/        # UI コンポーネント
│   ├── lib/               # ユーティリティ (API Client, utils)
│   ├── hooks/             # カスタムフック
│   ├── stores/            # Zustand ストア
│   └── public/            # 静的アセット
├── alembic/               # データベースマイグレーション
├── tests/                 # Backend テスト (pytest)
├── Dockerfile             # マルチステージビルド定義
├── render.yaml            # Render デプロイ設定
└── .specify/specs/        # SDD 仕様書 (本書)
```

## API 設計

- 全ての API エンドポイントは `/api` プレフィックスを持ちます。
- フロントエンドは同一ドメインの `/api` に対してリクエストを行います。
- 認証は Cookie (Session ID) を介して行われます。

## 権限管理

- **Admin (管理者)**: 家族設定の変更、招待コードの管理、メンバーの管理、赤ちゃんの追加・編集・削除が可能。
- **Member (一般メンバー)**: 記録の閲覧、追加、自身の記録の編集・削除が可能。

## CI/CD & リリースプロセス

- **Version Control**: GitHub
- **Automation**: GitHub Actions
- **Release Strategy**: Semantic Versioning (SemVer)
- **Release Tool**: python-semantic-release
