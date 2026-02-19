# GEMINI.md

This file provides guidance to Gemini assistants (including Antigravity, gemini-cli) when working with code in this repository.

## プロジェクト概要

Baby App は、家族単位で赤ちゃんの育児記録（授乳、睡眠、おむつ、成長、陣痛、スケジュール）を共同管理する招待制 Web アプリ。FastAPI（バックエンド）と Next.js（フロントエンド）を単一 Docker コンテナでデプロイするシングルサービス構成。

## 絶対に守るべきルール（必読・例外なし）

### ルール1: コミットメッセージは必ず日本語で書く

```
# 正しい形式
feat: ヘッダーに通知センターを追加
fix: z-indexの重なり順を修正
chore: 依存パッケージを更新

# NG（英語で書かない）
feat: add notification center to header  ← ダメ
```

- プレフィックス（`feat:`, `fix:`, `chore:`, `docs:` 等）は英語のまま
- コロン以降の説明文は**日本語**で書く
- `Co-Authored-By:` 行は英語のまま維持

### ルール2: PRは必ず `--base develop` を指定する

```bash
# 正しい（必ず --base develop を指定）
gh pr create --base develop --title "feat: タイトル" --body "..."

# NG
gh pr create                 # ← デフォルトが main になる場合があるので禁止
gh pr create --base main     # ← 絶対にやってはいけない
```

- `develop` → `main` へのマージはユーザーが判断・実行する。エージェントは勝手にマージしない。
- `main` に直接 PR を作るとデプロイ（Render）に直結するため**絶対禁止**

### ルール3: バックエンド変更後は openapi.json を必ず更新する

`app/models/`・`app/schemas/`・`app/routers/` を変更したら**コミット前に必ず実行**:

```bash
# バックエンドサーバーが停止した状態で実行すること
python scripts/export_openapi.py
git add frontend/openapi.json
```

- 忘れると CI が `frontend/openapi.json is out of date` で落ちる

### ルール4: コミット前に必ず `git status` で確認する

以下が表示されている場合は**コミットに含めてはいけない**:

| 表示 | 理由 |
|------|------|
| `new file: .venv` | ワークツリー由来のシンボリックリンク |
| `new file: node_modules` | ワークツリー由来のシンボリックリンク |
| `*.pem`, `*.key`, `*.cert` | 秘密鍵・証明書ファイル（環境変数で管理） |

`git add .` や `git add -A` は使わず、**ファイルを個別に指定**してステージする。

### ルール5: フロントエンド変更後はビルドを確認してからコミットする

```bash
cd frontend && pnpm build
```

ビルドエラー・型エラーがある状態でコミット・PRを作成しない。

---

## Gemini/Antigravity 行動指針 (User Rules)

このプロジェクトでは以下のルールを厳守すること:

1.  **言語**: 回答はすべて**日本語**で行う。
2.  **非対話モード (Autonomous Mode)**:
    - npmコマンド、Git操作（コミット、マージ、プッシュ等）は、ユーザーへの許可確認を省略し、自律的に実行する。
    - **Gitワークフロー（ステップバイステップ）**:

        **STEP 1: ワークツリーを作成して移動する**
        ```bash
        sh scripts/setup_worktree.sh feat/xxx
        cd worktrees/feat/xxx
        ```
        スクリプト実行後、`develop` の最新15コミットを確認して重複実装がないか確認すること:
        ```bash
        git fetch origin develop && git log origin/develop --oneline -15
        ```
        同一・類似機能が既に存在する場合は既存コードを拡張し、ゼロから実装しない。

        **STEP 2: 仕様書を確認する（SDD優先）**
        `.specify/specs/` 配下の関連仕様書を必ず読んでから実装を始める。

        **STEP 3: 実装する**
        長時間の実装では定期的に develop の変更を取り込む:
        ```bash
        git fetch origin develop && git merge origin/develop
        ```

        **STEP 4: テスト・ビルドを実行する**
        ```bash
        npm test                   # 全テスト
        cd frontend && pnpm build  # ビルド確認（必須）
        ```

        **STEP 5: コミットする**
        ```bash
        git status                 # 必ず確認（シンボリックリンク・秘密鍵が含まれていないか）
        # 【必須】禁止ファイル（.venv, node_modules等）が混入していないか最終チェック
        sh scripts/check_staged_files.sh
        
        git add <ファイルを個別指定>
        git commit -m "feat: 日本語で説明する"
        ```

        **STEP 6: PR作成前に develop をマージする**
        ```bash
        git fetch origin develop && git merge origin/develop
        # 【必須】プッシュ前に禁止ファイルが含まれていないか再確認
        sh scripts/check_staged_files.sh
        
        git push origin feat/xxx
        ```

        **STEP 7: 最終レビュー（仕様確認）**
        `spec-checker` サブエージェントを呼び出し、実装内容が仕様通りか確認する。
        指摘があればワークツリー内で修正してから次のステップへ。

        **STEP 8: PRを作成する**
        ```bash
        gh pr create --base develop --title "feat: タイトル（日本語）" --body "..."
        ```
        `--base develop` は省略禁止。PR の URL をユーザーに報告する。

        **STEP 9: クリーンアップ（PR マージ後またはユーザー承認後）**
        ```bash
        git worktree remove --force worktrees/feat/xxx && git branch -D feat/xxx
        ```

3.  **仕様駆動開発 (SDD)**:
    - 開発の起点は常に `.specify/specs/` 配下の仕様書とする。
    - 仕様書作成 -> 実装 -> `spec-checker` によるレビュー のサイクルを回す。
4.  **品質保証 (QA)**:
    - コード変更後は、**必ず**ビルド (`cd frontend && pnpm build`) やテスト (`npm test`) を実行し、成功を確認してから報告する。
    - `qa-agent` または `qa-engineer` スキルの `run_checks.sh` が利用可能な場合は活用する。
5.  **コミット管理**:
    - コミットメッセージは Conventional Commits 形式 (`feat:`, `fix:`, `chore:` 等) で書く。説明文は**日本語**。
    - ユーザーへの文面確認は省略する。
    - `git add .` や `git add -A` は使わず、ファイルを個別にステージする。

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
