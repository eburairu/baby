# GEMINI.md

This file provides guidance to Gemini assistants (including Antigravity, gemini-cli) when working with code in this repository.

## プロジェクト概要

Baby App は、家族単位で赤ちゃんの育児記録（授乳、睡眠、おむつ、成長、陣痛、スケジュール）を共同管理する招待制 Web アプリ。FastAPI（バックエンド）と Next.js（フロントエンド）を単一 Docker コンテナでデプロイするシングルサービス構成。

## Gemini/Antigravity 行動指針 (User Rules)

このプロジェクトでは以下のルールを厳守すること:

1.  **言語**: 回答はすべて**日本語**で行う。
2.  **非対話モード (Autonomous Mode)**:
    - npmコマンド、Git操作（コミット、マージ、プッシュ等）は、ユーザーへの許可確認を省略し、自律的に実行する。
    - **Gitワークフロー**:
        1. 開発は必ず `develop` から `git worktree` を作成して行う。
           - `sh scripts/setup_worktree.sh feat/xxx` を実行し、`worktrees/feat/xxx` ディレクトリに移動して作業すること。
        2. 実装および検証（ビルド・テスト）完了後、GitHub CLI (`gh`) を使用して `develop` ブランチに向けた Pull Request (PR) を作成する。
           - `gh pr create --base develop --head feat/xxx --title "feat: xxx" --body "..."`
        3. PR作成が完了したら、必ずメインディレクトリの `develop` ブランチに戻り、使用したワークツリーとローカルブランチを削除する。
           - `git worktree remove --force worktrees/feat/xxx && git branch -D feat/xxx`
        4. タスク完了時に作成した PR の URL をユーザーに報告する。
3.  **仕様駆動開発 (SDD)**:
    - 開発の起点は常に `.specify/specs/` 配下の仕様書とする。
    - 仕様書作成 -> 実装 -> `spec-checker` によるレビュー のサイクルを回す。
4.  **品質保証 (QA)**:
    - コード変更後は、**必ず**ビルド (`cd frontend && pnpm build`) やテスト (`npm test`) を実行し、成功を確認してから報告する。
    - `qa-agent` または `qa-engineer` スキルの `run_checks.sh` が利用可能な場合は活用する。
5.  **コミット管理**:
    - コミットメッセージは Conventional Commits 形式 (`feat:`, `fix:`, `chore:` 等) で自動生成する。
    - ユーザーへの文面確認は省略する。

## 技術スタック

- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic
- **Frontend**: Next.js (App Router, Static Export), TypeScript (strict), Tailwind CSS v4, SWR, Zustand, shadcn/ui
- **Database**: PostgreSQL (Neon)

- **ドキュメント**:
  - `GEMINI.md`: AIエージェント向けガイドライン・プロジェクト概要
  - `docs/TECH_INSIGHTS.md`: 技術的な工夫・最適化のメモ（人間・AI共用）


## エージェント・スキル (AI Agent Skills)

このプロジェクトでは、Vercel Labs の `agent-skills` を導入しています。以下のパスに、開発のベストプラクティスやルールが格納されています。作業を開始する前に、これらの内容を読み込んで遵守してください。

- **場所**: `.agents/skills/`
- **利用可能なスキル**:
  - `vercel-react-best-practices`: React/Next.js のパフォーマンス最適化ガイドライン
  - `vercel-composition-patterns`: コンポーネント設計のベストプラクティス
  - `web-design-guidelines`: ウェブデザインの一般的ガイドライン
  - `vercel-react-native-skills`: React Native 向けのガイドライン（主にモバイル開発時）

## ローカル開発環境のセットアップ

### 前提

- **Docker 不要**。DB は Neon のブランチを使用する。
- `.env` に `DATABASE_URL` を設定。`.env` は `.gitignore` 済み。

### DB 環境（Neon ブランチ構成）

| ブランチ名 | 用途 |
| ---------- | ---- |
| `production` | 本番（Render から参照） |
| `develop` | ローカル開発用 |

接続文字列は Neon MCP で取得可能。

### `.env` の設定例

```env
DATABASE_URL="postgresql://neondb_owner:<password>@<endpoint>.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
```
※ シェルで `source .env` する場合は値をダブルクォートで囲むこと。

### ローカル起動手順

```bash
# 0. 依存パッケージをインストール
# uv が未インストールの場合は先に入れる
pip install uv
# pytest/httpx を含む開発用パッケージをインストールする
uv pip install -r requirements-dev.txt

# 1. 仮想環境を有効化 (Python)
source .venv/bin/activate

# 2. 環境変数を読み込む
set -a && source .env && set +a

# 3. DB マイグレーション (必要時)
alembic upgrade head

# 4. バックエンド起動
uvicorn app.main:app --reload

# 5. フロントエンド起動 (別ターミナル)
cd frontend && pnpm dev
```

起動後:
- API: `http://localhost:8000/api`
- Frontend: `http://localhost:3000`

## アーキテクチャ

### シングルサービス構成
FastAPI が Next.js の静的ビルド (`frontend/out/`) を配信。
フロントエンドは `next.config.ts` で `output: 'export'` 設定済み。

### 認証フロー
Cookie ベースのセッション管理 (HttpOnly, 有効期限 7 日)。
`UserSession` テーブルで管理。

### データ階層
`Family → User → Baby → Records`
Admin / Member ロール、`verify_baby_access()` による権限チェック。

## ディレクトリ構成パターン

- `app/models/`: SQLAlchemy モデル
- `app/schemas/`: Pydantic スキーマ
- `app/routers/`: API エンドポイント
- `app/services/`: ビジネスロジック

## コマンドリファレンス

### テスト
```bash
npm test                   # 全テスト (Backend + Frontend)
npm run test:backend       # Backend only (pytest)
npm run test:frontend      # Frontend only (vitest)
```

### DB マイグレーション
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### フロントエンドビルド & 修正検証
**変更後は必ず以下を実行して検証すること:**
```bash
cd frontend && pnpm build
cd frontend && pnpm lint
```
