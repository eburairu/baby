# CLAUDE.md

## プロジェクト概要

Baby App — 家族単位で育児記録（授乳・睡眠・おむつ・成長等）を共同管理する招待制Webアプリ。

- **Backend**: FastAPI + PostgreSQL（Neon）
- **Frontend**: Next.js (App Router, Static Export), TypeScript, Tailwind CSS v4

## 回答スタイル

- 挨拶・前置き・段階報告・絵文字禁止。結論ファースト
- 指摘すべきことは率直に指摘

## アーキテクチャ

- FastAPI が `frontend/out/` を StaticFiles でマウント。全 API は `/api` プレフィックス
- 認証: Cookie ベース HttpOnly セッション（`UserSession` テーブル、7日有効）。`app/dependencies.py` の `get_current_user()` / `verify_baby_access()`
- データ階層: `Family → User → Baby → Records`（Admin / Member ロール）

## DB 接続（Neon）

| ブランチ | 用途 | ID |
| --- | --- | --- |
| `production` | 本番 | `br-restless-thunder-a1jvbo69` |
| `develop` | ローカル開発 | `br-super-tooth-a1z3r2p7` |

接続文字列は Neon MCP で取得:

```text
mcp__Neon__get_connection_string(projectId="still-feather-79533302", branchId="br-super-tooth-a1z3r2p7")
```

## 環境起動

```bash
source .venv/bin/activate && set -a && source .env && set +a
uvicorn app.main:app --reload   # バックエンド（:8000）
cd frontend && pnpm dev          # フロントエンド（:3000）
```

その他のコマンドは `package.json` の npm スクリプトを参照（`npm run test:backend`, `npm run migrate` 等）。

## 絶対に守るべきルール

### コミットメッセージ

種別プレフィックスは英語（`feat:`, `fix:`, `chore:` 等）、説明文は**日本語**。
例: `feat: ヘッダーに通知センターを追加`

### PR は必ず `develop` ブランチに向けて作成する

```bash
gh pr create --base develop  # --base develop は省略禁止
```

- ブランチフロー: `feat/*` → `develop` → `main`
- エージェントは `develop` → `main` のマージを勝手に行わない

### Git Worktree の強制使用（MUST）

開発作業は必ず `sh scripts/setup_worktree.sh feat/xxx` でワークツリーを作成して行う。
**禁止事項**: ルートリポジトリでの直接的な `git checkout -b` やファイル編集。

### バックエンド変更後は openapi.json を更新する

`app/models/`・`app/schemas/`・`app/routers/` を変更したら**コミット前に必ず**実行:

```bash
npm run schema:generate
git add frontend/openapi.json
```

### コミット禁止ファイル

絶対にコミットしないもの:

- `.venv`・`node_modules` — シンボリックリンク（ワークツリー由来）
- `*.pem`・`*.key`・`*.cert` — 秘密鍵・証明書ファイル

## 開発ワークフロー

ワークツリー作成・PR作成・クリーンアップのワークフローは各スクリプトを参照:

- `scripts/setup_worktree.sh` — ワークツリー作成（コメント付き）
- `scripts/create_pr.py` — PR作成（マルチライン body の改行崩れを防ぐため必須）
- `scripts/cleanup_worktrees.sh` — マージ済みワークツリーのクリーンアップ

実装前は `.specify/specs/` 配下の仕様書を確認すること。
