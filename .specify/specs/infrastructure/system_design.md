# システム設計書 (System Design)

Botoro の全体アーキテクチャと技術スタックを定義します。

## 概要

Botoro は、家族単位で赤ちゃんの育児記録（授乳、睡眠、おむつ、成長、陣痛、スケジュール）を共同管理するための Web アプリケーションです。
招待制を採用し、セキュアな家族共有環境を提供します。

## アーキテクチャ構成

本アプリケーションは **Next.js (Frontend)** と **FastAPI (Backend)** を組み合わせたシングルサービス構成を採用しています。

### シングルサービスデプロイメント

- **Frontend**: Next.js を使用し、`next build` (Static Export) で静的ファイルとして出力 (`frontend/out`) します。
- **Backend**: FastAPI が API エンドポイント (`/api/*`) を提供すると同時に、Frontend の静的ファイルをルート (`/*`) にマウントして配信します。
- **Deployment**: Render Native Python ランタイムを利用し、単一のサービスとして Render にデプロイされます。

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
- **Type Generation**: openapi-typescript（FastAPI スキーマから型を自動生成）

### Backend

- **Framework**: FastAPI (Python 3.10+)
- **ORM**: SQLAlchemy 2.0
- **Migration**: Alembic
- **Middleware**: CORSMiddleware, CSRFCookieMiddleware
- **Authentication**: Cookie-based Session (HttpOnly, Secure)

### Infrastructure & Database

- **Database**: PostgreSQL (Neon Serverless)
- **Runtime**: Render Native Python (Python 3.10)
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
│   ├── openapi.json       # FastAPI OpenAPI スキーマ（自動生成・コミット対象）
│   ├── app/               # App Router ページ・レイアウト
│   ├── components/        # UI コンポーネント
│   ├── lib/               # ユーティリティ (API Client, utils)
│   ├── hooks/             # カスタムフック
│   ├── stores/            # Zustand ストア
│   ├── types/
│   │   ├── generated/     # openapi-typescript による自動生成型
│   │   └── ...            # フロントエンド固有の手動型（徐々に削減）
│   └── public/            # 静的アセット
├── alembic/               # データベースマイグレーション
├── tests/                 # Backend テスト (pytest)
├── Dockerfile             # ローカル Docker 実行用（Render デプロイでは使用しない）
├── render.yaml            # Render デプロイ設定
└── .specify/specs/        # SDD 仕様書 (本書)
```

## データ設計基準 (Data Standards)

### タイムゾーンの扱い

- **Backend**: データベースにはタイムゾーンなしの UTC (`DateTime` / `naive`) として保存します。
- **API**: ISO 8601 形式の文字列でやり取りします。フロントエンドからの送信時にはタイムゾーン情報 (`Z` 等) を含めることが推奨されますが、バックエンドで比較・保存する際に適切に UTC naive に変換します。
- **Validation**: 未来日時のバリデーションを行う場合、クライアントとサーバーの時刻同期のズレを考慮し、許容誤差（デフォルト5分、定数 `FUTURE_DATE_BUFFER_MINUTES` で定義）を設けます。詳細な定数管理については [マジックナンバー排除規約](../development/magic_number_policy.md) を参照してください。

### 統合レコード形式 (UnifiedRecord)

ダッシュボードのタイムラインなどで複数の記録種別を横断的に表示するため、バックエンドは以下の統一された形式を `/api/babies/{id}/records` で返します。

- **`id`**: 各種別テーブルにおけるユニークID
- **`type`**: 記録種別 (`feeding`, `sleep`, `diaper`, `growth`, `contraction`, `note`)
- **`timestamp`**: 記録の主たる日時
- **`details`**: 種別ごとの詳細データ（`notes` など）を格納するオブジェクト
- **`comment_count`**: 記録に対するコメント数
- **`recorded_by_display_name`**: 記録者の表示名

## 権限管理

- **Admin (管理者)**: 家族設定の変更、招待コードの管理、メンバーの管理、赤ちゃんの追加・編集・削除が可能。
- **Member (一般メンバー)**: 記録の閲覧、追加、自身の記録の編集・削除が可能。

## CI/CD & リリースプロセス

- **Version Control**: GitHub
- **Automation**: GitHub Actions
- **Release Strategy**: Semantic Versioning (SemVer)
- **Release Tool**: semantic-release (Node.js)
- **Deployment Flow**:
    - `main` ブランチへのマージにより GitHub Actions が起動。
    - `semantic-release` がバージョンを決定し、GitHub Release と Tag を作成。
    - リリース完了後、GitHub Actions から Render の Deploy Hook を呼び出し、デプロイを実行。
    - Render 側の `autoDeploy` は無効化 (`false`) されており、重複デプロイを防止している。
- **スキーマ整合性チェック**: `frontend/openapi.json` の差分を CI で検出し、バックエンド変更時の更新漏れを防止する（詳細: `.specify/specs/development/openapi_type_generation.md`）。
