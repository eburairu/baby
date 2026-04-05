---
name: implement-harness
description: Planner→Generator→Evaluatorの3エージェントハーネスでissueを実装する。コンテキスト分離と独立UI評価で品質を確保。
argument-hint: "[issue_number]"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
  - mcp__playwright__browser_navigate
  - mcp__playwright__browser_snapshot
  - mcp__playwright__browser_click
  - mcp__playwright__browser_fill_form
  - mcp__playwright__browser_type
  - mcp__playwright__browser_press_key
  - mcp__playwright__browser_wait_for
  - mcp__playwright__browser_take_screenshot
---

# Planner → Generator → Evaluator ハーネス

3つの独立エージェントでissueを実装する。各フェーズは独立したコンテキストで実行する（コンテキスト不安の排除・自己評価バイアスの排除）。

```
Issue
  └─► [Planner]    仕様書を読み、実装計画 + 受け入れ条件(AC)を定義
  └─► [Generator]  TDD実装 → verify_all.sh (最大3回)
  └─► [Evaluator]  Playwright でUIを操作しACを検証
        └─► FAIL → Generatorにフィードバックしてリトライ
        └─► PASS → PR作成
```

---

## Phase 0: セットアップ

以下を実行してworktreeを作成する:

```bash
bash scripts/implement_issue.sh --setup-only $ARGUMENTS
```

出力の `---IMPL_INFO_START---` ～ `---IMPL_INFO_END---` から以下の変数を取得する:
- `WORKTREE_DIR` ← `IMPL_WORKTREE_DIR`
- `BRANCH_NAME` ← `IMPL_BRANCH_NAME`
- `ISSUE_NUMBER` ← `IMPL_ISSUE_NUMBER`
- `ISSUE_TYPE` ← `IMPL_ISSUE_TYPE`
- `ISSUE_TITLE` ← `IMPL_ISSUE_TITLE`
- `ISSUE_BODY` ← `IMPL_ISSUE_BODY`

ハーネス用ディレクトリを作成する:

```bash
mkdir -p {WORKTREE_DIR}/.harness
```

---

## Phase 1: Planner Agent

**Agent ツールで Planner を起動する**（fresh context）。以下のプロンプトを使用:

---
あなたはBotoro育児記録アプリのテックリードです。GitHub issue #{ISSUE_NUMBER} の実装計画を作成してください。

**Issue:**
タイトル: {ISSUE_TITLE}

{ISSUE_BODY}

**作業ディレクトリ:** {WORKTREE_DIR}

**タスク:**

### ステップ1: 調査
1. `.specify/specs/` 配下の関連仕様書を検索して読む
2. 既存コードの関連部分を確認する（app/routers/, app/models/, frontend/src/）

### ステップ2: 仕様書の作成・更新
issueの変更内容に応じて以下を判断して実行する:

- **新機能（feat）かつ仕様書が存在しない場合**: `.specify/specs/{カテゴリ}/{機能名}.md` を新規作成する
- **既存仕様書に記載がない内容を追加する場合**: 該当仕様書に不足セクションを追記する
- **バグ修正・リファクタのみで仕様の変化がない場合**: 仕様書の変更は不要（スキップ）

仕様書のカテゴリ: `auth/`, `tracking/`, `ui/`, `settings/`, `ai/`, `social/`, `infrastructure/`, `development/`

仕様書フォーマット（既存ファイルのスタイルに合わせる）:
```
# {機能名} 仕様書

## 1. 概要
## 2. 目的
## 3. 機能要件
## 4. APIエンドポイント（バックエンド変更がある場合）
## 5. セキュリティ考慮事項（該当する場合）
## 6. 受け入れ条件
```

仕様書を作成・更新した場合は、そのパスを `{WORKTREE_DIR}/.harness/plan.md` の「変更ファイル」に含める。

### ステップ3: 実装計画の作成
以下のセクションを含む実装計画を `{WORKTREE_DIR}/.harness/plan.md` に書き出す:

```
## 概要
（何をするか2-3文）

## 変更ファイル
（作成・変更するファイルのリスト。仕様書ファイルも含む）

## テスト計画
（書くべきテストケースのリスト。backend/frontendそれぞれ）

## 受け入れ条件 (AC)
（Playwright で検証可能な具体的なUI動作のリスト。できるだけ操作手順を明確に書く）
- AC-1: [操作手順] → [期待される結果]
- AC-2: ...

## UIテスト要否
REQUIRED / SKIP（理由: ...）
（APIのみの変更・DBマイグレーションのみ等の場合はSKIP）
```

すべて完了したら内容を確認して終了してください。コードの実装は行わない。

---

Plannerが完了したら `{WORKTREE_DIR}/.harness/plan.md` を読んで内容を確認する。

---

## Phase 2: Generator Agent（最大3回ループ）

ループ変数を初期化: `ATTEMPT=1`, `MAX_ATTEMPTS=3`

各ループで **Agent ツールで Generator を起動する**（fresh context）。以下のプロンプトを使用:

---
あなたはBotoro育児記録アプリのシニアエンジニアです。issue #{ISSUE_NUMBER} を実装してください。

**実装計画:** {WORKTREE_DIR}/.harness/plan.md を必ず読むこと

{EVAL_FEEDBACK_SECTION}
（前回のEvaluator失敗がある場合: "**前回のEvaluator指摘:**\n{WORKTREE_DIR}/.harness/eval_result.md の内容を読み、指摘された問題を修正してください"）

**作業ディレクトリ:** {WORKTREE_DIR}

**環境セットアップ（コマンド実行前に必ず実行）:**
```
cd {WORKTREE_DIR} && source .venv/bin/activate && set -a && source .env && set +a
```

**実装手順（この順序を守ること）:**
1. plan.md を読み、「変更ファイル」「テスト計画」を確認する
2. テストを先に書く（実行してRedを確認）
   - backend変更: `tests/` 配下にpytestテストを追加
   - frontend変更: `frontend/src` 配下に `__tests__` ディレクトリを作成しJestテストを追加
3. 最小限の変更で実装し、テストをGreenにする
4. `app/models/`, `app/schemas/`, `app/routers/` を変更した場合:
   ```
   python scripts/export_openapi.py && git add frontend/openapi.json
   ```
5. 全チェック実行:
   ```
   sh scripts/verify_all.sh
   ```
   失敗したら原因を修正して再実行する（スキップ禁止）
6. コミット（verify通過後のみ）:
   ```
   git commit -m "{ISSUE_TYPE}: #{ISSUE_NUMBER} <日本語説明>

Closes #{ISSUE_NUMBER}"
   ```

**制約:**
- 関係ないコードの改変・リファクタ禁止
- .venv/, node_modules/, worktrees/ はコミットしない
- verify_all.sh が通らない限りコミットしない
- git push / PR作成禁止（スクリプトが後続で行う）
- テストデータに実在しうる鍵・トークン・パスワード形式を使わない（GitGuardian誤検知防止）。ダミー値は `"dummy_xxx_for_testing"` 形式にする

---

Generator完了後、以下を確認する:

```bash
git -C {WORKTREE_DIR} log --oneline origin/develop..HEAD
```

コミットが0件の場合はGeneratorが失敗したとみなし、ATTEMPT+1してリトライする（MAX_ATTEMPTSに達したらユーザーに報告して停止）。

---

## Phase 3: Evaluator Agent

### plan.md の「UIテスト要否」を確認

```bash
grep "UIテスト要否" {WORKTREE_DIR}/.harness/plan.md
```

`SKIP` の場合はEvaluatorをスキップしてPhase 4へ進む。

### サーバー起動

```bash
cd {WORKTREE_DIR}
source .venv/bin/activate && set -a && source .env && set +a
docker compose ps db 2>/dev/null | grep -q "running" || docker compose up db -d
sleep 2
npm run migrate 2>/dev/null || true
uvicorn app.main:app --host 127.0.0.1 --port 8001 > /tmp/harness_server_{ISSUE_NUMBER}.log 2>&1 &
echo $! > /tmp/harness_server_{ISSUE_NUMBER}.pid
sleep 4
curl -s http://localhost:8001/api/health || echo "WARNING: サーバー起動を確認できません"
```

### Evaluator Agent 起動

**Agent ツールで Evaluator を起動する**（fresh context、Playwright MCP使用）。以下のプロンプトを使用:

---
あなたはQAエンジニアです。実装された機能をPlaywrightで検証してください。

**検証対象URL:** http://localhost:8001
**テストアカウント:** ユーザー名 `testuser` / パスワード `password123`

**受け入れ条件（{WORKTREE_DIR}/.harness/plan.md のACセクションを読むこと）:**
（plan.mdから受け入れ条件セクションを読んでください）

**検証手順:**
1. plan.md を読み、受け入れ条件(AC)リストを確認する
2. 各ACをPlaywrightで実際に操作して検証する
   - ページへナビゲート → 操作 → 結果を観察
   - スクリーンショットを撮って状態を確認する
3. 結果を `{WORKTREE_DIR}/.harness/eval_result.md` に書き出す

**出力フォーマット:**
```
## Evaluator結果 (Attempt {ATTEMPT})

### AC-1: [条件名]
状態: ✅ PASS / ❌ FAIL
操作: [実際に行った操作]
観察: [確認した内容]

（以降のACも同様）

### 総合判定
PASS / FAIL

### Generator へのフィードバック（FAIL時のみ）
[失敗したACと、実装で修正が必要な具体的な問題点]
```

**重要:** 実装の改善提案ではなく、観察した事実のみを記録してください。

---

### サーバー停止とループ判定

```bash
kill $(cat /tmp/harness_server_{ISSUE_NUMBER}.pid 2>/dev/null) 2>/dev/null || true
rm -f /tmp/harness_server_{ISSUE_NUMBER}.pid
```

`{WORKTREE_DIR}/.harness/eval_result.md` を読んで「総合判定」を確認:
- **PASS**: Phase 4へ進む
- **FAIL かつ ATTEMPT < MAX_ATTEMPTS**: `ATTEMPT+1` してPhase 2へ戻る（eval_result.md のフィードバックをGeneratorに渡す）
- **FAIL かつ ATTEMPT = MAX_ATTEMPTS**: ユーザーに状況を報告して停止する

---

## Phase 4: PR作成

```bash
bash scripts/implement_issue.sh --finish {BRANCH_NAME}
```

出力の `PR_URL=...` をユーザーに報告する。

---

## 完了通知

```bash
source {WORKTREE_DIR}/.env 2>/dev/null || source .env 2>/dev/null || true
curl -X POST https://api.getmoshi.app/api/webhook \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$MOSHI_TOKEN\", \"title\": \"Harness完了\", \"message\": \"#{ISSUE_NUMBER} {ISSUE_TITLE} — implemented via Planner/Generator/Evaluator harness\"}"
```
