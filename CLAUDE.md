# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Baby App は、家族単位で赤ちゃんの育児記録（授乳、睡眠、おむつ、成長、陣痛、スケジュール）を共同管理する招待制 Web アプリ。FastAPI（バックエンド）と Next.js（フロントエンド）を単一 Docker コンテナでデプロイするシングルサービス構成。

## 技術スタック

- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic
- **Frontend**: Next.js (App Router, Static Export), TypeScript (strict), Tailwind CSS v4, SWR, Zustand, shadcn/ui
- **Database**: PostgreSQL (本番: Neon production ブランチ / ローカル: Neon develop ブランチ) + Alembic マイグレーション
- **Deployment**: Docker マルチステージビルド → Render

## ローカル開発環境のセットアップ

### 前提

- **Docker 不要**。DB は Neon のブランチを使用する。
- `.env` に `DATABASE_URL` を設定することで接続先を切り替える。
- `.env` は `.gitignore` で除外済み（コミット不可）。

### DB 環境（Neon ブランチ構成）

| ブランチ名 | 用途 | ブランチ ID |
| ---------- | ---- | ----------- |
| `production` | 本番（Render から参照） | `br-restless-thunder-a1jvbo69` |
| `develop` | ローカル開発用（production のスナップショット） | `br-super-tooth-a1z3r2p7` |

接続文字列は Neon MCP で取得する:

```text
mcp__Neon__get_connection_string(projectId="still-feather-79533302", branchId="br-super-tooth-a1z3r2p7")
```

### `.env` の設定

```env
DATABASE_URL="postgresql://neondb_owner:<password>@<endpoint>.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```

> **注意**: URL に `&` が含まれるため、シェルで `source .env` する場合は値をダブルクォートで囲む。

### ローカル起動手順

```bash
# 1. 仮想環境を有効化
source .venv/bin/activate

# 2. 環境変数を読み込む
set -a && source .env && set +a

# 3. DB マイグレーションを適用（初回・スキーマ変更時）
alembic upgrade head

# 4. バックエンドを起動
uvicorn app.main:app --reload

# 5. フロントエンドを起動（別ターミナル）
cd frontend && npm run dev
```

起動後:

- API: `http://localhost:8000/api`
- フロントエンド dev server: `http://localhost:3000`

### コマンドリファレンス

```bash
# テスト実行
npm test                   # バックエンド + フロントエンドの全テストを一括実行
npm run test:backend       # バックエンドのみ（pytest）
npm run test:frontend      # フロントエンドのみ（vitest）

# DB マイグレーション
alembic revision --autogenerate -m "description"
alembic upgrade head

# フロントエンドビルド（変更後は必ず実行・型チェック含む）
cd frontend && npm run build
cd frontend && npm run lint
```

## アーキテクチャ

### シングルサービス構成

FastAPI が Next.js の静的ビルド（`frontend/out/`）を StaticFiles でマウントして配信する。全 API は `/api` プレフィックス。フロントエンドの `next.config.ts` は `output: 'export'` を設定済み。

### 認証フロー

Cookie ベースのセッション管理（HttpOnly）。`UserSession` テーブルでトークンを管理（有効期限 7 日）。フロントエンドは `credentials: 'include'` でリクエスト送信。認証チェックは `app/dependencies.py` の `get_current_user()` で行う。

### データ階層

`Family → User → Baby → Records` の順に権限が階層化。Baby へのアクセス権は `dependencies.py` の `verify_baby_access()` で検証。ユーザーは Admin / Member ロールを持つ。

### バックエンド構成パターン

- `app/models/` — SQLAlchemy モデル（テーブル定義）
- `app/schemas/` — Pydantic スキーマ（入出力バリデーション）
- `app/routers/` — API エンドポイント（`/api/*`）
- `app/services/` — ビジネスロジック（パスワードハッシュ等）

## コーディング規約

- **SDD 優先**: コード変更前に `.specify/specs/` 配下の仕様書を確認・必要に応じて更新する
- **Python**: 型ヒント必須、PEP 8 準拠
- **TypeScript**: strict モード、関数コンポーネント + Hooks
- **コミット**: Conventional Commits 形式（`feat:`, `fix:`, `chore:`, `docs:` 等）
- **変更後**: 必ず `cd frontend && npm run build` でビルド確認してから報告する
