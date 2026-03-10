#!/bin/bash
# scripts/daily_audit.sh
# コードベースを毎日監査して改善提案・不具合修正提案をGitHub issueに登録する
# 使い方: bash scripts/daily_audit.sh

set -eu
trap '' PIPE  # head/awk によるSIGPIPEを無視

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

LABEL="auto-audit"
DATE=$(date +%Y-%m-%d)
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

log() { echo "[$(date +%H:%M:%S)] $*"; }

# --- 1. ラベル確保 ---
gh label create "$LABEL" --color "#fbca04" --description "自動コードベース監査で生成" 2>/dev/null || true

# --- 2. コンテキスト収集 ---
log "コンテキスト収集中..."
{
  echo "=== プロジェクト概要 ==="
  cat CLAUDE.md 2>/dev/null || true

  echo ""
  echo "=== ソースファイル一覧 ==="
  find . -type f \( -name "*.py" -o -name "*.ts" -o -name "*.tsx" \) \
    ! -path "*/node_modules/*" ! -path "*/.venv/*" ! -path "*/out/*" \
    ! -path "*/__pycache__/*" ! -path "*/worktrees/*" ! -path "*/.next/*" \
    | sort

  echo ""
  echo "=== 直近30コミット ==="
  git log --oneline -30

  echo ""
  echo "=== バックエンドモデル・スキーマ ==="
  find app/models app/schemas -name "*.py" 2>/dev/null | sort | while read -r f; do
    echo "--- $f ---"
    cat "$f"
  done | awk 'NR<=600'

  echo ""
  echo "=== APIルーター一覧（先頭60行 each） ==="
  find app/routers -name "*.py" 2>/dev/null | sort | while read -r f; do
    echo "--- $f ---"
    awk 'NR<=60' "$f"
  done | awk 'NR<=400'

  echo ""
  echo "=== フロントエンドコンポーネント一覧 ==="
  find frontend/src \( -name "*.tsx" -o -name "*.ts" \) 2>/dev/null \
    ! -path "*/node_modules/*" ! -path "*/.next/*" | sort

  echo ""
  echo "=== 仕様書（先頭40行 each） ==="
  find .specify/specs -name "*.md" 2>/dev/null | sort | while read -r f; do
    echo "--- $f ---"
    awk 'NR<=40' "$f"
  done | awk 'NR<=400'

  echo ""
  echo "=== 既存の auto-audit issue（重複チェック用） ==="
  gh issue list --state all --label "$LABEL" --json number,title --limit 500 2>/dev/null \
    | python3 -c "
import sys, json
for i in json.load(sys.stdin):
    print(f\"#{i['number']}: {i['title']}\")
"
} > "$TEMP_DIR/context.txt"

CONTEXT_SIZE=$(wc -c < "$TEMP_DIR/context.txt")
log "コンテキストサイズ: ${CONTEXT_SIZE} bytes"

# --- 3. 新規提案生成 ---
log "Geminiで提案生成中..."

PROMPT='あなたはシニアエンジニアです。以下のBotoro育児記録アプリのコードベース情報を分析し、実装可能な改善提案・不具合修正提案・新機能提案を生成してください。

出力は必ず以下のJSON形式のみ（前後の説明文・コードブロック記号なし）:
{"proposals": [{"type": "bug|enhancement|refactor", "title": "件名（日本語50文字以内）", "body": "詳細説明（マークダウン、背景・現状・提案内容・期待効果を含む）", "priority": "high|medium|low"}]}

ルール:
- 提案数は4〜6件
- 具体的なファイル名・関数名を含める
- 「既存の auto-audit issue」セクションに記載されているタイトルと重複しない
- typeがbugは明確な不具合のみ（推測は enhancement にする）
- 優先度 high は本番に影響する問題のみ
- 実装方針を body に必ず含める'

gemini -p "$PROMPT" < "$TEMP_DIR/context.txt" > "$TEMP_DIR/gemini_raw.txt" 2>&1 || {
  log "ERROR: Gemini呼び出しに失敗"
  cat "$TEMP_DIR/gemini_raw.txt"
  exit 1
}

# JSON部分を抽出
python3 -c "
import sys, re, json
text = sys.stdin.read()
text = re.sub(r'\`\`\`json\s*', '', text)
text = re.sub(r'\`\`\`\s*', '', text)
m = re.search(r'\{.*\}', text, re.DOTALL)
if not m:
    print('ERROR: JSONが見つかりません', file=sys.stderr)
    sys.exit(1)
data = json.loads(m.group())
print(json.dumps(data, ensure_ascii=False))
" < "$TEMP_DIR/gemini_raw.txt" > "$TEMP_DIR/proposals.json" || {
  log "ERROR: GeminiのレスポンスからJSONを抽出できませんでした"
  cat "$TEMP_DIR/gemini_raw.txt"
  exit 1
}

PROPOSAL_COUNT=$(python3 -c "import json; d=json.load(open('$TEMP_DIR/proposals.json')); print(len(d['proposals']))")
log "${PROPOSAL_COUNT}件の提案を生成"

# --- 4. 重複チェック → issue作成 ---
log "issue作成中..."

gh issue list --state all --label "$LABEL" --json title --limit 500 2>/dev/null \
  | python3 -c "import json,sys; [print(i['title']) for i in json.load(sys.stdin)]" \
  > "$TEMP_DIR/existing_titles.txt"

python3 -c "
import json, sys
data = json.load(open('$TEMP_DIR/proposals.json'))
for p in data['proposals']:
    print(json.dumps(p, ensure_ascii=False))
" | while IFS= read -r proposal; do
  TITLE=$(echo "$proposal" | python3 -c "import json,sys; print(json.load(sys.stdin)['title'])")
  BODY=$(echo "$proposal" | python3 -c "import json,sys; print(json.load(sys.stdin)['body'])")
  TYPE=$(echo "$proposal" | python3 -c "import json,sys; print(json.load(sys.stdin)['type'])")
  PRIORITY=$(echo "$proposal" | python3 -c "import json,sys; print(json.load(sys.stdin)['priority'])")

  if grep -qxF "$TITLE" "$TEMP_DIR/existing_titles.txt" 2>/dev/null; then
    log "[SKIP] 重複: $TITLE"
    continue
  fi

  # typeからGitHubラベルへのマッピング
  case "$TYPE" in
    bug)         LABEL_FLAGS="--label $LABEL --label bug" ;;
    enhancement) LABEL_FLAGS="--label $LABEL --label enhancement" ;;
    *)           LABEL_FLAGS="--label $LABEL" ;;
  esac

  FULL_BODY="$BODY

---
*自動監査: $DATE | Type: $TYPE | Priority: $PRIORITY*"

  # shellcheck disable=SC2086
  ISSUE_URL=$(gh issue create \
    --title "$TITLE" \
    --body "$FULL_BODY" \
    $LABEL_FLAGS \
    2>/dev/null) || {
    log "[ERROR] issue作成失敗: $TITLE"
    continue
  }

  ISSUE_NUMBER=$(echo "$ISSUE_URL" | grep -o '[0-9]*$')
  log "[CREATED] #$ISSUE_NUMBER: $TITLE"
done

# --- 5. 解決済みissueの自動クローズ ---
log "解決済みissueのチェック中..."

gh issue list --state open --label "$LABEL" --json number,title,body,createdAt --limit 100 2>/dev/null \
  | python3 -c "
import json, sys
for i in json.load(sys.stdin):
    print(json.dumps(i, ensure_ascii=False))
" | while IFS= read -r issue; do
  NUMBER=$(echo "$issue" | python3 -c "import json,sys; print(json.load(sys.stdin)['number'])")
  TITLE=$(echo "$issue" | python3 -c "import json,sys; print(json.load(sys.stdin)['title'])")
  BODY=$(echo "$issue" | python3 -c "import json,sys; print(json.load(sys.stdin)['body'])")
  CREATED_AT=$(echo "$issue" | python3 -c "import json,sys; print(json.load(sys.stdin)['createdAt'])")

  COMMITS=$(git log --oneline --since="$CREATED_AT" 2>/dev/null | head -30)
  if [ -z "$COMMITS" ]; then
    continue
  fi

  CLOSE_PROMPT="GitHub issue「$TITLE」について、issue作成後のコミット履歴を確認してください。

【issue内容】
$BODY

【issue作成後のコミット】
$COMMITS

このissueの内容がコミット履歴から解決済みと判断できますか？YESまたはNOのみ答えてください。"

  RESULT=$(echo "$CLOSE_PROMPT" | gemini -p "上記を分析してYESまたはNOのみ答えてください。" 2>/dev/null \
    | tr -d '[:space:]' | grep -o 'YES\|NO' | head -1 || echo "NO")

  if [ "$RESULT" = "YES" ]; then
    gh issue close "$NUMBER" \
      --comment "自動監査により解決済みと判定しました（$DATE）。誤判定の場合は再オープンしてください。" \
      2>/dev/null \
      && log "[CLOSED] #$NUMBER: $TITLE" \
      || log "[CLOSE_FAIL] #$NUMBER: クローズに失敗"
  fi
done

log "監査完了 ($DATE)"
