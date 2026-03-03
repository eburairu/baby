# GEMINI.md

このファイルは Gemini CLI がこのリポジトリで作業する際のガイドラインを定義する。

## プロジェクト概要

Botoro — 家族単位で赤ちゃんの育児記録（授乳・睡眠・おむつ・成長等）を共同管理する招待制 Web アプリ。

- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic
- **Frontend**: Next.js (App Router, Static Export), TypeScript (strict), Tailwind CSS v4, SWR, Zustand, shadcn/ui
- **Database**: PostgreSQL (Neon) + Alembic マイグレーション
- **Deployment**: Docker マルチステージビルド → Render（`main` マージで自動デプロイ）

### アーキテクチャ
- FastAPI が `frontend/out/` を StaticFiles でマウント。全 API は `/api` プレフィックス
- 認証: Cookie ベース HttpOnly セッション（`UserSession` テーブル、7日有効）
- データ階層: `Family → User → Baby → Records`（Admin / Member ロール）
- バックエンド構成: `app/models/`・`app/schemas/`・`app/routers/`・`app/services/`

---

## 絶対に守るべきルール（例外なし）

### コミットメッセージは日本語で書く

```
# 正しい
feat: ヘッダーに通知センターを追加
fix: z-index の重なり順を修正

# NG（英語禁止）
feat: add notification center to header
```

- プレフィックス（`feat:`, `fix:`, `chore:`, `docs:` 等）は英語のまま
- コロン以降の説明文は**日本語**
- `Co-Authored-By:` 行は英語のまま

### PR は必ず `--base develop` を指定する

```bash
gh pr create --base develop --title "feat: タイトル" --body "..."
```

**⚠️ 重要: PR 作成時の注意点**
シェルコマンドの引数で直接マルチラインの `--body` を渡すと改行が崩れるため、**必ず `scripts/create_pr.py` を使用**するか、一時ファイルを作成して `--body-file` で指定すること。

```bash
# 推奨される作成方法（create_pr.py を使用）
python3 scripts/create_pr.py --base develop --head feat/xxx --title "feat: 日本語" <<EOF
## 概要
...

Closes #XXX
EOF
```
```

- `develop` → `main` のマージはユーザーが判断・実行する（エージェントは勝手にマージしない）
- `main` への直接 PR は**絶対禁止**（Render デプロイに直結）

### Git Worktree の強制使用（MUST）

開発作業を行う際は、**原則として `sh scripts/setup_worktree.sh` を使用して `worktrees/` 配下で作業すること**。

- **禁止事項**: メインリポジトリ（ルート）での直接的なコード編集や、機能実装のための `git checkout -b` は厳禁。
- **例外**: **仕様書（`.specify/specs/`）または設計ドキュメント（`.planning/`）の更新のみを行う場合**は、ルートリポジトリの `develop` ブランチで直接編集・コミットを行ってもよい。
- **目的**: 常に `develop` の最新状態をメインディレクトリに維持し、並行開発を円滑にするため。

### バックエンド変更後は openapi.json を必ず更新する

`app/models/`・`app/schemas/`・`app/routers/` を変更したら**コミット前に実行**:

```bash
python scripts/export_openapi.py
git add frontend/openapi.json
```

CI が `frontend/openapi.json is out of date` で落ちる原因になる。

### コミット前の必須チェック

```bash
# PR 作成前の全チェック（必ず通してからコミット）
sh scripts/verify_all.sh

# ステージング前の禁止ファイルチェック（自動的に pre-commit hook でも実行される）
sh scripts/check_staged_files.sh
```

`git add .` / `git add -A` は使わず、**ファイルを個別に指定**してステージする。

絶対にコミットしないもの:
- `.venv`・`node_modules` — ワークツリー由来のシンボリックリンク
- `*.pem`・`*.key`・`*.cert` — 秘密鍵・証明書ファイル

---

## Gemini CLI の活用モード

### モード選択の指針

| 目的 | コマンド | 説明 |
|------|----------|------|
| コードベース調査・分析（安全） | `gemini --approval-mode=plan` | ファイル読み取り専用。変更なし |
| Claude Code の補助（テキスト処理） | `gemini -p "..."` | stdin/ファイルを高速処理して返す |
| 実装補助（ファイル編集のみ自動）  | `gemini --approval-mode=auto_edit` | Git 操作は確認あり |
| フルオートノミー（全工程自律実行） | `gemini --yolo` または `gemini --approval-mode=yolo` | 確認なしで全操作実行 |

### このプロジェクト固有の活用コマンド集

#### 調査・分析

```bash
# 特定機能に関連するファイルと依存関係を調査（読み取り専用）
gemini --approval-mode=plan "授乳記録機能に関連するファイルと依存関係を全て洗い出して"

# 実装予定機能の影響範囲チェック
gemini --approval-mode=plan "通知機能を追加する場合に変更が必要なファイルを列挙して"

# バグの根本原因調査
git log --oneline -20 | gemini -p "最近のコミットからバグの混入タイミングを推測して"
```

#### テキスト処理・要約（Claude Code の補助として）

```bash
# 大量ログの解析
cat server.log | gemini -p "エラーパターンを分析して原因を特定して"

# 長い diff のコードレビュー
git diff origin/develop...HEAD | gemini -p "この変更にバグやセキュリティリスクがないか確認して"

# PR 向けの変更サマリー生成
git diff origin/develop...HEAD | gemini -p "この変更をユーザー向けに日本語で要約して。PR の body に使うので Markdown 形式で"

# 仕様書の要点整理
cat .specify/specs/**/*.md | gemini -p "実装済みの機能と未実装の機能を一覧にして"
```

#### 自律実装（`--yolo` モード）

新機能実装を Gemini に丸ごと委任する場合:

```bash
# ワークツリーに入った状態で実行
gemini --yolo "
  仕様書 .specify/specs/xxx.md に基づいて実装せよ。
  完了したら sh scripts/verify_all.sh を実行し、全チェックが通るまで修正を続けよ。
  通ったら develop に対して PR を作成し、ルートディレクトリに戻って develop をチェックアウトしてから完了報告せよ。
"
```

#### セッション再開

```bash
# 前回のセッションを再開（長時間タスクの継続）
gemini --resume latest

# セッション一覧を確認
gemini --list-sessions

```

### AI エージェント専用ガードレール（Mandatory）

Gemini CLI には **BeforeTool フック** (`.gemini/settings.json`) が設定されており、AI エージェントが `/worktrees/` 配下以外で `write_file` や `replace` を実行しようとすると、ツール自体の実行が自動的にブロックされる。

開発作業を行う際は、必ず `sh scripts/setup_worktree.sh` を使用してワークツリーを作成し、そのディレクトリ内で作業すること。

---

## SDD（仕様駆動開発）徹底プロトコル

仕様書の確認・更新をスキップせず、常に「仕様が正、コードが従」の状態を維持するため、以下のルールを厳守する。

### 1. タスク開始時の「仕様書ファースト」
- いかなる修正・機能追加も、まず `.specify/specs/` 配下の関連仕様書を検索・精読することから始める。
- 仕様書が存在しない場合は、実装前に必ず新規作成する。

### 2. 仕様の更新（Code follows Spec）
- ユーザーの指示が既存の仕様と異なる、または仕様にない詳細を含む場合、**コードを修正する前に仕様書を更新**しなければならない。
- 仕様書の更新後は、必ず `spec-checker` サブエージェントを呼び出し、「計画レビュー」として仕様の整合性を確認する。

### 3. 実装中の参照
- 実装中は常に仕様書の「受け入れ条件（AC）」を意識し、AC を満たさないコードを書いてはならない。

---

## 自律実装フロー（`--yolo` 使用時）

Gemini が `--yolo` で実装を行う場合の標準手順:

**STEP 0: 現在位置の物理チェック (MANDATORY)**
```bash
pwd
```
出力が `/worktrees/` 配下でない場合、**直ちに作業を停止し**、STEP 1 に進んでワークツリーを作成すること。ルートディレクトリでの直接編集は絶対に許可されない。

**STEP 1: 重複実装チェックとワークツリー作成**
```bash
git fetch origin develop && git log origin/develop --oneline -15
sh scripts/setup_worktree.sh feat/xxx
cd worktrees/feat/xxx
```

**STEP 1.5: 仕様書の特定・更新・承認（SDD 必須フェーズ）**
1.  `.specify/specs/` から関連する仕様書を特定し、内容を読み込む。
2.  今回の指示内容を反映するために仕様書の更新が必要か判断する。
3.  **更新が必要な場合**:
    - 仕様書を修正する。
    - `spec-checker` を呼び出し、修正後の仕様書がプロジェクト全体と整合しているか確認する。
    - `spec-checker` の承認（または指摘の修正）が完了するまで実装に進んではならない。

**STEP 2: 実装設計（TDD 前準備）**
仕様書の受け入れ条件（AC）を具体化し、テストケースを設計する。

**STEP 2.5: テスト設計・作成（TDD Red フェーズ）**

参照: `.specify/specs/development/tdd_workflow.md`

1. 仕様書の受け入れ条件（AC）を箇条書きで列挙する
2. 各 AC に対応するテストケースを設計する
3. テストコードを先に書く
   - バックエンド: `tests/test_<feature>.py`
   - フロントエンド: `frontend/__tests__/<feature>.test.ts`
4. テストを実行して Red（失敗）であることを確認する
   ```bash
   npm run test:backend   # または
   npm run test:frontend
   ```
5. Red 確認後、STEP 3（実装）に進む

**STEP 3: 実装**
実装は「テストを Green にする最小実装」を目指す。Green 確認後、必要に応じてリファクタリングを行う（テストは引き続き Green を維持すること）。

長時間の作業では定期的に develop を取り込む:
```bash
git fetch origin develop && git merge origin/develop
```

**STEP 4: 全チェック実行（必須）**
```bash
sh scripts/verify_all.sh
```
このスクリプトが以下を順番に実行する:
1. `check_staged_files.sh` — 禁止ファイルの混入防止
2. `pytest` — バックエンドテスト
3. `python scripts/export_openapi.py` — OpenAPI スキーマ更新
4. `pnpm types:generate` — TypeScript 型生成
5. `pnpm lint` — フロントエンド Lint
6. `pnpm build` — ビルド確認（型エラーも検出）

**STEP 5: コミット**
```bash
git add <ファイルを個別指定>   # -A / . は使わない
git status                     # 禁止ファイルが含まれていないか確認
git commit -m "feat: 日本語で説明"
```

**STEP 6: develop 最新化 → プッシュ → PR 作成 → ルート復帰**
```bash
git fetch origin develop && git merge origin/develop
git push -u origin feat/xxx
gh pr create --base develop --title "feat: タイトル（日本語）" --body "..."

**⚠️ 重要: PR 作成時の注意点**
シェルコマンドの引数で直接マルチラインの `--body` を渡すと改行が崩れるため、**必ず `scripts/create_pr.py` を使用**するか、一時ファイルを作成して `--body-file` で指定すること。

```bash
# 推奨される作成方法（create_pr.py を使用）
python3 scripts/create_pr.py --base develop --head feat/xxx --title "feat: 日本語" <<EOF
## 概要
...

Closes #XXX
EOF
```

# 重要: PR 作成後の帰還手順
cd "$(git rev-parse --git-common-dir)/.."
git checkout develop
git pull origin develop
```
PR の URL をユーザーに報告する。ワークツリーはユーザーの承認後に削除する。
メインディレクトリ（ルート）が `develop` ブランチであることを確認してから完了報告を行うこと。

---

## サブエージェント連携ガイドライン

`spec-checker` や `code-reviewer` などのサブエージェントを呼び出す際は、効率化と `MAX_TURN` 回避のために以下のルールを遵守すること。

### spec-checker の呼び出しプロトコル
サブエージェントは自律的な探索能力を持つが、メインエージェントが事前に情報を整理して渡すことでターン数を劇的に削減できる。

**呼び出し前に必ず実行すること**:
1. メインエージェント側で `glob` や `grep` を行い、**関連する仕様書のパス**（`.specify/specs/` 配下）と、**関連するコードのパス**を特定する。
2. 仕様書の「受け入れ基準 (AC)」や重要な制約を `read_file` して把握しておく。

**呼び出し時のプロンプトテンプレート（必須）**:
```text
【フェーズ】: [計画レビュー | 実装レビュー | 検証レビュー]
【対象仕様書】: [パス1, パス2...]
【対象コード】: [パス1, パス2...]
【具体的な確認項目】: [例：新しく追加した xxx フィールドのバリデーションが、仕様書 p.5 の制約と一致しているか確認して]

（補足情報：メインエージェント側で把握した重要な差分やコンテキストがあれば追記）
```

**効率化の原則**:
1. **コンテキストの明示**: パスを曖昧にせず、具体的なファイル名を指定する。
2. **目的の限定**: 「全体を確認して」という曖昧な依頼を避け、確認ポイントを絞り込む。
3. **事前調査の活用**: メインエージェント側で `grep` や `read_file` した結果を要約して伝えてもよい。


### edit の活用（一括置換）
大量のファイルや、同じパターンの繰り返し置換を行う場合は `edit` サブエージェントを活用する。
- **カウント**: `grep -c` 等で事前に置換対象数を把握し、`replace` ツールの `expected_replacements` に渡す。
- **フォールバック**: 純正ツールでコンテキストが一致せず失敗が続く場合は、シェルコマンド（`perl`, `sed`）による一括置換を検討する。

---

## エージェントスキル

`.agents/skills/` 配下にプロジェクト固有のスキルが格納されている。作業前に読み込んで従うこと。

- `vercel-react-best-practices`: React/Next.js パフォーマンス最適化ガイドライン
- `vercel-composition-patterns`: コンポーネント設計のベストプラクティス
- `web-design-guidelines`: ウェブデザインの一般的ガイドライン

---

## ローカル開発環境

### 前提
- Python 3.10 以上、Node.js 20 以上、pnpm
- **Docker 不要** — DB は Neon のブランチを使用

### DB 環境（Neon ブランチ構成）

| ブランチ名 | 用途 |
|---|---|
| `production` | 本番（Render から参照） |
| `develop` | ローカル開発用 |

接続文字列は Neon MCP で取得:
```
mcp__Neon__get_connection_string(projectId="still-feather-79533302", branchId="br-super-tooth-a1z3r2p7")
```

### 起動手順

```bash
# Python 環境
source .venv/bin/activate
set -a && source .env && set +a
alembic upgrade head
uvicorn app.main:app --reload      # :8000

# フロントエンド（別ターミナル）
cd frontend && pnpm dev            # :3000
```

---

## コマンドリファレンス

```bash
# 全チェック一括（PR 作成前に必須）
sh scripts/verify_all.sh

# テスト
npm run test:backend               # pytest
npm run test:frontend              # vitest

# DB マイグレーション
alembic revision --autogenerate -m "description"
alembic upgrade head

# OpenAPI スキーマ更新
python scripts/export_openapi.py

# フロントエンド
cd frontend && pnpm build          # ビルド
cd frontend && pnpm lint           # Lint
npm run types:generate             # TypeScript 型生成
```
