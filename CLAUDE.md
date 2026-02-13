# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Baby-App は、家族単位で赤ちゃんの育児記録（授乳、睡眠、おむつ、成長、陣痛、スケジュール）を共同管理する招待制 Web アプリ。FastAPI（バックエンド）と Next.js（フロントエンド）を単一 Docker コンテナでデプロイするシングルサービス構成。

## 技術スタック

- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic
- **Frontend**: Next.js (App Router, Static Export), TypeScript (strict), Tailwind CSS v4, SWR, Zustand, shadcn/ui
- **Database**: PostgreSQL (本番: Neon / ローカル: Docker) + Alembic マイグレーション
- **Deployment**: Docker マルチステージビルド → Render

## コマンド

### Backend

```bash
source .venv/bin/activate
uvicorn app.main:app --reload

# DB マイグレーション
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend

```bash
cd frontend
npm run dev
npm run build   # 変更後は必ず実行（型チェック含む）
npm run lint
```

### ローカル DB 起動

```bash
docker-compose up   # PostgreSQL on port 5434
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
