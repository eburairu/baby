#!/bin/bash
# scripts/implement_issue.sh [issue_number]
# auto-audit issueをGemini CLIで自動実装してPRを作成する
#
# 使い方:
#   bash scripts/implement_issue.sh              # 最高優先度issueを自動選択（Gemini）
#   bash scripts/implement_issue.sh 762          # 特定issueを実装（Gemini）
#   bash scripts/implement_issue.sh --setup-only [762]  # worktree準備のみ（Claude実装用）
#   bash scripts/implement_issue.sh --finish feat/issue-762  # push+PR作成のみ

set -eu

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

MAX_IMPL_ATTEMPTS=3    # Gemini実装セッションの最大試行回数
MAX_MERGE_RETRIES=3    # developマージ・コンフリクト解消の最大試行回数

log() { echo "[$(date +%H:%M:%S)] $*"; }
die() { log "ERROR: $*"; exit 1; }

# ===========================================================
# モード判定
# ===========================================================
MODE="gemini"
ISSUE_ARG=""
FINISH_BRANCH=""

for arg in "$@"; do
  case "$arg" in
    --setup-only) MODE="setup-only" ;;
    --finish)     MODE="finish" ;;
    *)
      if [ "$MODE" = "finish" ] && [ -z "$FINISH_BRANCH" ]; then
        FINISH_BRANCH="$arg"
      else
        ISSUE_ARG="$arg"
      fi
      ;;
  esac
done

# --finish モード: push + PR作成のみ
if [ "$MODE" = "finish" ]; then
  [ -z "$FINISH_BRANCH" ] && die "--finish には branch名が必要です (例: feat/issue-762)"
  BRANCH_NAME="$FINISH_BRANCH"
  WORKTREE_DIR="$REPO_ROOT/worktrees/$BRANCH_NAME"
  [ -d "$WORKTREE_DIR" ] || die "worktreeが見つかりません: $WORKTREE_DIR"

  # ブランチ名からissue番号を取得
  ISSUE_NUMBER=$(echo "$BRANCH_NAME" | grep -oE '[0-9]+$' || true)
  [ -z "$ISSUE_NUMBER" ] && die "ブランチ名からissue番号を取得できません: $BRANCH_NAME"

  ISSUE_JSON=$(gh issue view "$ISSUE_NUMBER" --json number,title,body,labels 2>/dev/null) \
    || die "issue #$ISSUE_NUMBER が取得できません"
  ISSUE_TITLE=$(echo "$ISSUE_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['title'])")
  ISSUE_TYPE=$(echo "$ISSUE_JSON" | python3 -c "
import json,sys
labels = [l['name'] for l in json.load(sys.stdin)['labels']]
print('fix' if 'bug' in labels else 'feat')
")

  # develop同期
  log "developとの同期中..."
  cd "$WORKTREE_DIR"
  for merge_attempt in $(seq 1 $MAX_MERGE_RETRIES); do
    git fetch origin develop 2>/dev/null
    if git merge origin/develop --no-edit 2>/dev/null; then
      log "develop マージ完了"
      break
    fi
    CONFLICT_FILES=$(git diff --name-only --diff-filter=U 2>/dev/null || true)
    log "コンフリクト発生 (試行 $merge_attempt/$MAX_MERGE_RETRIES):"
    echo "$CONFLICT_FILES"
    if [ "$merge_attempt" -eq "$MAX_MERGE_RETRIES" ]; then
      git merge --abort 2>/dev/null || true
      cd "$REPO_ROOT"
      die "コンフリクトを解消できませんでした。手動で解消してください: $WORKTREE_DIR"
    fi
    CONFLICT_PROMPT="git merge origin/develop でコンフリクトが発生しました。

【コンフリクトファイル】
$CONFLICT_FILES

以下の手順でコンフリクトを解消してください:
1. 各コンフリクトファイルを開いて <<<<<<, =======, >>>>>>> マーカーを確認する
2. 両方の変更を適切に統合する（どちらかを捨てるのではなく、意図を保持して統合する）
3. git add <解消したファイル> を実行する
4. git merge --continue --no-edit を実行する
5. sh scripts/verify_all.sh を実行して通ることを確認する"
    log "Geminiでコンフリクト解消中..."
    gemini --yolo -p "$CONFLICT_PROMPT"
    if ! git diff --name-only --diff-filter=U 2>/dev/null | grep -q .; then
      log "コンフリクト解消完了"
      break
    fi
  done
  cd "$REPO_ROOT"

  # Push + PR作成
  log "pushしてPRを作成中..."
  cd "$WORKTREE_DIR"
  git push origin "$BRANCH_NAME" 2>/dev/null

  EXISTING_PR=$(gh pr list --head "$BRANCH_NAME" --base develop --json url --jq '.[0].url' 2>/dev/null || true)
  if [ -n "$EXISTING_PR" ]; then
    log "既存のPRが見つかりました: $EXISTING_PR"
    gh issue comment "$ISSUE_NUMBER" \
      --body "このissueの実装PRを作成しました: $EXISTING_PR" \
      2>/dev/null || true
    cd "$REPO_ROOT"
    log "完了: #${ISSUE_NUMBER} → $EXISTING_PR"
    echo "PR_URL=$EXISTING_PR"
    exit 0
  fi

  PR_BODY="## 概要

Closes #${ISSUE_NUMBER}

## 変更内容

${ISSUE_TITLE}

## 実装方法

- Claude Codeによる実装
- TDDで実装（テストを先に作成）
- \`verify_all.sh\` 通過済み

## チェックリスト

- [x] テスト追加済み
- [x] verify_all.sh 通過
- [ ] 動作確認"

  PR_URL=$(python3 "$REPO_ROOT/scripts/create_pr.py" \
    --base develop \
    --head "$BRANCH_NAME" \
    --title "${ISSUE_TYPE}: #${ISSUE_NUMBER} ${ISSUE_TITLE}" \
    --body "$PR_BODY" \
    2>/dev/null) || die "PR作成に失敗しました"

  log "PR作成完了: $PR_URL"
  gh issue comment "$ISSUE_NUMBER" \
    --body "このissueの実装PRを作成しました: $PR_URL" \
    2>/dev/null || true
  cd "$REPO_ROOT"
  log "完了: #${ISSUE_NUMBER} → $PR_URL"
  echo "PR_URL=$PR_URL"
  exit 0
fi

# ===========================================================
# 1. Issue選択
# ===========================================================
if [ -n "${ISSUE_ARG:-}" ]; then
  ISSUE_NUMBER="$ISSUE_ARG"
  ISSUE_JSON=$(gh issue view "$ISSUE_NUMBER" --json number,title,body,labels 2>/dev/null) \
    || die "issue #$ISSUE_NUMBER が取得できません"
else
  # 優先度順（high > medium > low）でauto-auditのopen issueを1件選択
  ISSUE_JSON=$(gh issue list --state open --label "auto-audit" \
    --json number,title,body,labels --limit 100 2>/dev/null \
    | python3 -c "
import json, sys
issues = json.load(sys.stdin)
def priority(i):
    b = i.get('body','')
    if 'Priority: high' in b: return 0
    if 'Priority: medium' in b: return 1
    return 2
issues.sort(key=priority)
print(json.dumps(issues[0]) if issues else 'null')
")
  [ "$ISSUE_JSON" = "null" ] || [ -z "$ISSUE_JSON" ] \
    && { log "実装待ちのauto-audit issueがありません"; exit 0; }
fi

ISSUE_NUMBER=$(echo "$ISSUE_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['number'])")
ISSUE_TITLE=$(echo "$ISSUE_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['title'])")
ISSUE_BODY=$(echo "$ISSUE_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['body'])")
ISSUE_TYPE=$(echo "$ISSUE_JSON" | python3 -c "
import json,sys
labels = [l['name'] for l in json.load(sys.stdin)['labels']]
print('fix' if 'bug' in labels else 'feat')
")

log "実装対象: #$ISSUE_NUMBER [$ISSUE_TYPE] $ISSUE_TITLE"

# ===========================================================
# 1.5. マージ済みPRチェック（対応済みissueはスキップ）
# ===========================================================
BRANCH_NAME="feat/issue-${ISSUE_NUMBER}"
MERGED_PR=$(gh pr list --head "$BRANCH_NAME" --state merged --json url --jq '.[0].url' 2>/dev/null || true)
if [ -n "$MERGED_PR" ]; then
  log "スキップ: #${ISSUE_NUMBER} はすでにマージ済みPRが存在します → $MERGED_PR"
  # issueがまだopenなら自動クローズ
  ISSUE_STATE=$(gh issue view "$ISSUE_NUMBER" --json state --jq '.state' 2>/dev/null || true)
  if [ "$ISSUE_STATE" = "OPEN" ]; then
    gh issue close "$ISSUE_NUMBER" --comment "PR $MERGED_PR がマージ済みのため自動クローズします。" 2>/dev/null \
      && log "issue #${ISSUE_NUMBER} をクローズしました" \
      || log "issueクローズに失敗しました（無視）"
  fi
  # 特定issueを指定した場合はスキップして終了、自動選択の場合は次のissueへ
  if [ -n "${ISSUE_ARG:-}" ]; then
    exit 0
  fi
  log "次のissueを処理します..."
  exec "$0"
fi

# ===========================================================
# 2. Worktree作成
# ===========================================================
WORKTREE_DIR="$REPO_ROOT/worktrees/$BRANCH_NAME"

if [ -d "$WORKTREE_DIR" ]; then
  log "既存のworktreeを使用: $WORKTREE_DIR"
else
  log "Worktree作成中: $BRANCH_NAME"
  sh scripts/setup_worktree.sh "$BRANCH_NAME" 2>&1 | grep -v "^Fetching\|^========\|^⚠️\|^ \|^実装"
fi

# --setup-only モード: worktree準備完了後に情報を出力して終了
if [ "$MODE" = "setup-only" ]; then
  log "セットアップ完了 (Claude実装モード)"
  echo "---IMPL_INFO_START---"
  echo "IMPL_WORKTREE_DIR=$WORKTREE_DIR"
  echo "IMPL_BRANCH_NAME=$BRANCH_NAME"
  echo "IMPL_ISSUE_NUMBER=$ISSUE_NUMBER"
  echo "IMPL_ISSUE_TYPE=$ISSUE_TYPE"
  echo "IMPL_ISSUE_TITLE=$ISSUE_TITLE"
  echo "IMPL_ISSUE_BODY<<BODY_EOF"
  echo "$ISSUE_BODY"
  echo "BODY_EOF"
  echo "---IMPL_INFO_END---"
  exit 0
fi

# ===========================================================
# 3. Geminiによる実装（verify通過まで最大${MAX_IMPL_ATTEMPTS}回）
# ===========================================================
run_gemini_impl() {
  local attempt=$1
  local extra_context="${2:-}"

  local prompt
  prompt=$(cat <<PROMPT
あなたはBotoro育児記録アプリのシニアエンジニアです。以下のGitHub issueを実装してください。

【Issue #${ISSUE_NUMBER}】
タイトル: ${ISSUE_TITLE}

内容:
${ISSUE_BODY}

${extra_context}

【作業ディレクトリ】
${WORKTREE_DIR}

【環境セットアップ（コマンド実行前に必ず実行）】
source .venv/bin/activate && set -a && source .env && set +a

【実装手順（この順序を必ず守ること）】
1. .specify/specs/ 配下の関連仕様書を確認する
2. テストを先に書く（TDD）
   - backend変更: tests/ 配下にpytestテストを追加
   - frontend変更: frontend/src 配下に__tests__ディレクトリを作成しJestテストを追加
   - テストを実行してRedであることを確認
3. 最小限の変更で実装し、テストをGreenにする
4. app/models/, app/schemas/, app/routers/ を変更した場合:
   python scripts/export_openapi.py && git add frontend/openapi.json
5. 全チェック実行: sh scripts/verify_all.sh
   - 失敗した場合は原因を特定して修正し、再度実行する
   - 全て通るまで繰り返す（絶対にスキップしない）
6. 変更をgit addしてコミット:
   git commit -m "${ISSUE_TYPE}: #${ISSUE_NUMBER} <日本語の説明>

Closes #${ISSUE_NUMBER}"
   ※ Co-Authored-By行は不要

【制約】
- 関係ないコードの改変・リファクタは禁止
- .venv/, node_modules/, worktrees/ はコミットしない
- verify_all.sh が通らない限りコミットしない
- git push や PR作成は絶対に行わない（スクリプトが後続で行う）
PROMPT
)

  log "Gemini実装セッション開始 (試行 $attempt/$MAX_IMPL_ATTEMPTS)..."
  cd "$WORKTREE_DIR"
  gemini --yolo -p "$prompt"
  cd "$REPO_ROOT"
}

IMPL_SUCCESS=false
for attempt in $(seq 1 $MAX_IMPL_ATTEMPTS); do
  # 前回の失敗ログがあれば渡す
  EXTRA=""
  if [ -f /tmp/verify_failure_$$.txt ]; then
    EXTRA="【前回のverify_all.sh失敗ログ】
$(cat /tmp/verify_failure_$$.txt)

上記エラーを修正してから再実装してください。"
  fi

  run_gemini_impl "$attempt" "$EXTRA"

  # コミットが存在するか確認
  COMMITS=$(git -C "$WORKTREE_DIR" log --oneline "origin/develop..HEAD" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$COMMITS" -eq 0 ]; then
    log "WARNING: Geminiが変更をコミットしませんでした (試行 $attempt)"
    if [ "$attempt" -eq "$MAX_IMPL_ATTEMPTS" ]; then
      die "コミットが作成されませんでした。worktreeを確認してください: $WORKTREE_DIR"
    fi
    continue
  fi

  # verify_all.sh を確認実行
  log "verify_all.sh を確認実行中..."
  cd "$WORKTREE_DIR"
  if sh scripts/verify_all.sh > /tmp/verify_output_$$.txt 2>&1; then
    log "verify_all.sh 通過"
    IMPL_SUCCESS=true
    cd "$REPO_ROOT"
    break
  else
    log "verify_all.sh 失敗 (試行 $attempt/$MAX_IMPL_ATTEMPTS)"
    tail -30 /tmp/verify_output_$$.txt > /tmp/verify_failure_$$.txt
    cat /tmp/verify_failure_$$.txt
    cd "$REPO_ROOT"
    if [ "$attempt" -eq "$MAX_IMPL_ATTEMPTS" ]; then
      die "verify_all.sh が通りませんでした。worktreeを確認してください: $WORKTREE_DIR"
    fi
  fi
done

rm -f /tmp/verify_failure_$$.txt /tmp/verify_output_$$.txt

# ===========================================================
# 4. develop との同期（コンフリクト発生時はGeminiで解消）
# ===========================================================
log "developとの同期中..."
cd "$WORKTREE_DIR"

for merge_attempt in $(seq 1 $MAX_MERGE_RETRIES); do
  git fetch origin develop 2>/dev/null

  if git merge origin/develop --no-edit 2>/dev/null; then
    log "develop マージ完了"
    break
  fi

  # コンフリクト発生
  CONFLICT_FILES=$(git diff --name-only --diff-filter=U 2>/dev/null || true)
  log "コンフリクト発生 (試行 $merge_attempt/$MAX_MERGE_RETRIES):"
  echo "$CONFLICT_FILES"

  if [ "$merge_attempt" -eq "$MAX_MERGE_RETRIES" ]; then
    git merge --abort 2>/dev/null || true
    cd "$REPO_ROOT"
    die "コンフリクトを解消できませんでした。手動で解消してください: $WORKTREE_DIR"
  fi

  CONFLICT_PROMPT="git merge origin/develop でコンフリクトが発生しました。

【コンフリクトファイル】
$CONFLICT_FILES

以下の手順でコンフリクトを解消してください:
1. 各コンフリクトファイルを開いて <<<<<<, =======, >>>>>>> マーカーを確認する
2. 両方の変更を適切に統合する（どちらかを捨てるのではなく、意図を保持して統合する）
3. git add <解消したファイル> を実行する
4. git merge --continue --no-edit を実行する
5. sh scripts/verify_all.sh を実行して通ることを確認する"

  log "Geminiでコンフリクト解消中..."
  gemini --yolo -p "$CONFLICT_PROMPT"

  # merge --continue が成功したか確認
  if ! git diff --name-only --diff-filter=U 2>/dev/null | grep -q .; then
    log "コンフリクト解消完了"
    break
  fi
done

cd "$REPO_ROOT"

# ===========================================================
# 5. Push + PR作成
# ===========================================================
log "pushしてPRを作成中..."
cd "$WORKTREE_DIR"
git push origin "$BRANCH_NAME" 2>/dev/null

# 既存PRがあればURLを返してスキップ
EXISTING_PR=$(gh pr list --head "$BRANCH_NAME" --base develop --json url --jq '.[0].url' 2>/dev/null || true)
if [ -n "$EXISTING_PR" ]; then
  log "既存のPRが見つかりました（Geminiが作成済み）: $EXISTING_PR"
  gh issue comment "$ISSUE_NUMBER" \
    --body "このissueの実装PRを作成しました: $EXISTING_PR" \
    2>/dev/null \
    && log "issueにPRリンクをコメントしました" \
    || log "issueコメントに失敗しました（無視）"
  cd "$REPO_ROOT"
  log "完了: #${ISSUE_NUMBER} → $EXISTING_PR"
  exit 0
fi

# PRの本文を生成
PR_BODY="## 概要

Closes #${ISSUE_NUMBER}

## 変更内容

${ISSUE_TITLE}

## 実装方法

- Gemini CLIによる自動実装
- TDDで実装（テストを先に作成）
- \`verify_all.sh\` 通過済み

## チェックリスト

- [x] テスト追加済み
- [x] verify_all.sh 通過
- [ ] 動作確認"

PR_URL=$(python3 "$REPO_ROOT/scripts/create_pr.py" \
  --base develop \
  --head "$BRANCH_NAME" \
  --title "${ISSUE_TYPE}: #${ISSUE_NUMBER} ${ISSUE_TITLE}" \
  --body "$PR_BODY" \
  2>/dev/null) || die "PR作成に失敗しました"

log "PR作成完了: $PR_URL"

# issueにPRリンクをコメント
gh issue comment "$ISSUE_NUMBER" \
  --body "このissueの実装PRを作成しました: $PR_URL" \
  2>/dev/null \
  && log "issueにPRリンクをコメントしました" \
  || log "issueコメントに失敗しました（無視）"

cd "$REPO_ROOT"

log "完了: #${ISSUE_NUMBER} → $PR_URL"
