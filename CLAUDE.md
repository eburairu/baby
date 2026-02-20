# CLAUDE.md

## プロジェクト概要

Baby App — 家族単位で育児記録（授乳・睡眠・おむつ・成長等）を共同管理する招待制 Web アプリ。

- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic
- **Frontend**: Next.js (App Router, Static Export), TypeScript (strict), Tailwind CSS v4, SWR, Zustand, shadcn/ui
- **Database**: PostgreSQL (Neon) + Alembic マイグレーション
- **Deployment**: Docker マルチステージビルド → Render

## アーキテクチャ

- FastAPI が `frontend/out/` を StaticFiles でマウント。全 API は `/api` プレフィックス
- 認証: Cookie ベース HttpOnly セッション（`UserSession` テーブル、7日有効）。`app/dependencies.py` の `get_current_user()` / `verify_baby_access()`
- データ階層: `Family → User → Baby → Records`（Admin / Member ロール）
- バックエンド構成: `app/models/`（モデル）、`app/schemas/`（バリデーション）、`app/routers/`（エンドポイント）、`app/services/`（ロジック）

## DB 接続（Neon）

| ブランチ | 用途 | ID |
|---|---|---|
| `production` | 本番 | `br-restless-thunder-a1jvbo69` |
| `develop` | ローカル開発 | `br-super-tooth-a1z3r2p7` |

接続文字列は Neon MCP で取得:
```
mcp__Neon__get_connection_string(projectId="still-feather-79533302", branchId="br-super-tooth-a1z3r2p7")
```

## よく使うコマンド

```bash
# 環境起動
source .venv/bin/activate && set -a && source .env && set +a
uvicorn app.main:app --reload   # バックエンド（:8000）
cd frontend && pnpm dev          # フロントエンド（:3000）

# テスト
npm run test:backend    # pytest
npm run test:frontend   # vitest

# DB マイグレーション
alembic revision --autogenerate -m "description"
alembic upgrade head

# フロントエンドビルド（変更後は必須）
cd frontend && pnpm build
```

## 絶対に守るべきルール

### コミットメッセージ

種別プレフィックスは英語（`feat:`, `fix:`, `chore:` 等）、説明文は**日本語**。
例: `feat: ヘッダーに通知センターを追加`

### PR は必ず `develop` ブランチに向けて作成する

```bash
gh pr create --base develop  # --base develop は省略禁止
```

- ブランチフロー: `feat/*` → `develop` → `main`
- `develop` → `main` のマージはユーザーが判断（エージェントは勝手にマージしない）

### Git Worktree の強制使用（MUST）

開発作業を行う際は、**必ず `sh scripts/setup_worktree.sh` を使用して `worktrees/` 配下で作業すること**。

- **禁止事項**: メインリポジトリ（ルート）での直接的な `git checkout -b` やファイル編集は厳禁。
- **目的**: 常に `develop` の最新状態をメインディレクトリに維持し、並行開発を円滑にするため。

### バックエンド変更後は openapi.json を更新する

`app/models/`・`app/schemas/`・`app/routers/` を変更したら**コミット前に必ず**（サーバー停止中に）実行:

```bash
python scripts/export_openapi.py
git add frontend/openapi.json
```

### コミット前の必須チェック

```bash
git add <ファイル名>  # -A や . は使わず個別にステージ
git status           # 以下が含まれていないか確認
```

絶対にコミットしないもの:
- `.venv`・`node_modules` — シンボリックリンク（ワークツリー由来）
- `*.pem`・`*.key`・`*.cert` — 秘密鍵・証明書ファイル

### フロントエンド変更後はビルドを確認する

```bash
cd frontend && pnpm build  # 型エラーもここで検出される
```

## 開発ワークフロー（Git Worktree）

**開発は必ずワークツリーを作成してから始める。ルートディレクトリで直接作業しない。**

```bash
# STEP 1: ワークツリー作成（develop の最新コミットを確認し、実装予定機能が既にマージされていないかチェック）
sh scripts/setup_worktree.sh feat/xxx
cd worktrees/feat/xxx

# STEP 2: 仕様書確認（コード変更前に .specify/specs/ 配下を読み、必要に応じて更新）
ls .specify/specs/

# STEP 3: 実装（Python: 型ヒント必須 / TypeScript: strict モード）
# 長時間実装では定期的に develop を取り込む
git fetch origin develop && git merge origin/develop

# STEP 4: テスト & ビルド確認
npm run test:backend && npm run test:frontend
cd frontend && pnpm build

# STEP 5: コミット（上記ルール参照）

# STEP 6: PR 作成前に develop をマージしてプッシュ
git fetch origin develop && git merge origin/develop
git push origin feat/xxx

# STEP 7: PR 作成
gh pr create --base develop --title "feat: タイトルを日本語で" --body "..."

# STEP 8: ルートディレクトリへの復帰（重要）
cd ../..
git checkout develop
git pull origin develop

# STEP 9: クリーンアップ（PR マージ後またはユーザー承認後）
git worktree remove --force worktrees/feat/xxx
git branch -D feat/xxx
```
