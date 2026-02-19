# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Baby App は、家族単位で赤ちゃんの育児記録（授乳、睡眠、おむつ、成長、陣痛、スケジュール）を共同管理する招待制 Web アプリ。FastAPI（バックエンド）と Next.js（フロントエンド）を単一 Docker コンテナでデプロイするシングルサービス構成。

## 技術スタック

- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic
- **Frontend**: Next.js (App Router, Static Export), TypeScript (strict), Tailwind CSS v4, SWR, Zustand, shadcn/ui
- **Database**: PostgreSQL (本番: Neon production ブランチ / ローカル: Neon develop ブランチ) + Alembic マイグレーション
- **Deployment**: Docker マルチステージビルド → Render

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
# 0. 依存パッケージをインストール（初回・requirements変更時）
# uv が未インストールの場合は先に入れる
pip install uv
# pytest/httpx を含む開発用パッケージをインストールする
uv pip install -r requirements-dev.txt

# 1. 仮想環境を有効化
source .venv/bin/activate

# 2. 環境変数を読み込む
set -a && source .env && set +a

# 3. DB マイグレーションを適用（初回・スキーマ変更時）
alembic upgrade head

# 4. バックエンドを起動
uvicorn app.main:app --reload

# 5. フロントエンドを起動（別ターミナル）
cd frontend && pnpm dev
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
cd frontend && pnpm build
cd frontend && pnpm lint
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

## 絶対に守るべきルール（AIエージェント必読）

### コミットメッセージは必ず日本語で書く

```
# 正しい形式
feat: ヘッダーに通知センターを追加
fix: z-indexの重なり順を修正
chore: 依存パッケージを更新

# NG（英語はダメ）
feat: add notification center to header
```

- 種別プレフィックス（`feat:`, `fix:`, `chore:`, `docs:` 等）は英語のまま
- 説明文は日本語
- `Co-Authored-By:` 行は英語のまま維持

### PRは必ず `develop` ブランチに向けて作成する

```bash
# 正しい
gh pr create --base develop

# NG（main に直接 PR を作るな）
gh pr create --base main  # ← 絶対にやってはいけない
gh pr create              # ← デフォルトが main になる場合があるので明示必須
```

- ブランチフロー: `feat/*` → `develop` → `main`
- `develop` → `main` へのマージはユーザーが判断・実行する（エージェントが勝手にマージしない）
- `main` に直接 PR を作るとデプロイ（Render）に直結するため絶対禁止

### バックエンド変更後は openapi.json を必ず更新する

`app/models/`・`app/schemas/`・`app/routers/` を変更したら**コミット前に必ず実行**:

```bash
python scripts/export_openapi.py
# 出力が frontend/openapi.json に書き込まれる
git add frontend/openapi.json
```

- 忘れると CI が `frontend/openapi.json is out of date` で落ちる
- このスクリプトはバックエンドサーバーが **停止した状態** で実行すること

### コミット前の必須チェック

```bash
git status  # 必ず確認してからステージする
```

以下が `git status` に表示されている場合は**絶対にコミットしない**:

- `new file: .venv` — シンボリックリンク（ワークツリー由来）
- `new file: node_modules` — シンボリックリンク（ワークツリー由来）
- `*.pem`、`*.key`、`*.cert` — 秘密鍵・証明書ファイル（環境変数で管理すること）

### フロントエンド変更後は必ずビルドを確認する

```bash
cd frontend && pnpm build
```

- ビルドエラーがある状態でコミット・PRを作成しない
- 型エラーもビルド時に検出される（`tsc --noEmit` 相当）

---

## コーディング規約

### Git Worktree（自律ワークフロー）— ステップバイステップ

**開発は必ずワークツリーを作成してから始める。ルートディレクトリで直接作業しない。**

#### STEP 1: ワークツリーを作成して移動する

```bash
# リポジトリルートで実行
sh scripts/setup_worktree.sh feat/xxx
cd worktrees/feat/xxx
```

スクリプト実行後に `develop` の最新コミットが表示されるので、**実装予定の機能が既にマージされていないか必ず確認する**。

```bash
# 手動確認コマンド
git fetch origin develop && git log origin/develop --oneline -15
```

重複実装はコンフリクトの原因になる。マージ済みなら作業不要。

#### STEP 2: 仕様書を確認する（SDD 優先）

```bash
# 関連仕様書を確認
ls .specify/specs/
```

コード変更前に `.specify/specs/` 配下の仕様書を読み、必要に応じて更新する。

#### STEP 3: 実装する

- **Python**: 型ヒント必須、PEP 8 準拠
- **TypeScript**: strict モード、関数コンポーネント + Hooks
- 長時間の実装では定期的に develop の変更を取り込む:
  ```bash
  git fetch origin develop && git merge origin/develop
  ```

#### STEP 4: 動作確認・テストを実行する

```bash
# バックエンドテスト
source .venv/bin/activate && set -a && source .env && set +a
npm run test:backend

# フロントエンドテスト
npm run test:frontend

# フロントエンドビルド（必須）
cd frontend && pnpm build
```

#### STEP 5: コミットする

```bash
git status  # シンボリックリンク・秘密鍵が含まれていないか確認
git add <ファイル名>  # -A や . は使わず個別にステージ
git commit -m "feat: 実装内容を日本語で説明"
```

#### STEP 6: PR 作成前に develop をマージする

```bash
git fetch origin develop && git merge origin/develop
# コンフリクトがあれば解消してから続行
git push origin feat/xxx
```

#### STEP 7: 最終レビュー（仕様確認）

`spec-checker` サブエージェントを呼び出し、実装内容が仕様通りか確認する。指摘があればワークツリー内で修正してから次のステップへ。

#### STEP 8: PR を作成する

```bash
gh pr create --base develop --title "feat: タイトルを日本語で" --body "..."
```

`--base develop` は**省略禁止**。

#### STEP 9: クリーンアップ（PR マージ後またはユーザー承認後）

```bash
git worktree remove --force worktrees/feat/xxx
git branch -D feat/xxx
```

---

### その他のコーディング規約

- **Python**: 型ヒント必須、PEP 8 準拠
- **TypeScript**: strict モード、関数コンポーネント + Hooks
- **コミット**: Conventional Commits 形式（`feat:`, `fix:`, `chore:`, `docs:` 等）、説明文は日本語
