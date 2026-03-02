#!/bin/bash

# scripts/check_staged_files.sh
# コミット対象（ステージング済み）のファイルに禁止ファイルが含まれていないかチェックする

# ============================================================
# ルートリポジトリの保護ブランチへの直接コミットをブロック
# ただし、仕様書（.specify/specs/）の更新のみの場合は許可する
# ============================================================
TOPLEVEL=$(git rev-parse --show-toplevel 2>/dev/null)
CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null)
PROTECTED_BRANCHES=("develop" "main")

# ステージングされたファイル一覧を取得
STAGED_FILES=$(git diff --cached --name-only)

# すべてが仕様書（.specify/specs/）または設計ドキュメント（.planning/）配下かどうかを判定
ONLY_SPECS=true
if [ -z "$STAGED_FILES" ]; then
  ONLY_SPECS=false
else
  for file in $STAGED_FILES; do
    if [[ ! "$file" =~ ^\.specify/specs/ ]] && [[ ! "$file" =~ ^\.planning/ ]]; then
      ONLY_SPECS=false
      break
    fi
  done
fi

if [ "$ONLY_SPECS" = "false" ] && [ -d "$TOPLEVEL/.git" ]; then
  for branch in "${PROTECTED_BRANCHES[@]}"; do
    if [ "$CURRENT_BRANCH" = "$branch" ]; then
      echo "❌ エラー: ルートリポジトリの '$branch' ブランチに直接コミットできません（コード変更が含まれています）。"
      echo "   ワークツリーを作成してから作業してください:"
      echo "   sh scripts/setup_worktree.sh feat/your-feature-name"
      exit 1
    fi
  done
fi

if [ "$ONLY_SPECS" = "true" ] && [ -d "$TOPLEVEL/.git" ]; then
  echo "ℹ️  通知: 仕様書または設計ドキュメントの更新のみであるため、'$CURRENT_BRANCH' ブランチへの直接コミットを許可します。"
fi

FORBIDDEN_PATTERNS=(".venv" "node_modules" "worktrees/")
EXIT_CODE=0

echo "🔍 ステージングされたファイルの検証中..."

# ステージングされたファイル一覧を取得
STAGED_FILES=$(git diff --cached --name-only)

for file in $STAGED_FILES; do
  for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      # ワークツリー内の正当なパス（worktrees/xxx/frontend/src/...など）は許可し、
      # ルートやワークツリー直下のシンボリックリンクそのものの追加を阻止する
      if [[ "$file" == "$pattern" ]] || [[ "$file" == */"$pattern" ]]; then
        echo "❌ エラー: 禁止ファイルがステージングされています: $file"
        echo "   このファイルはコミットできません。'git rm --cached $file' で解除してください。"
        EXIT_CODE=1
      fi
    fi
  done
done

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ 検証パス: 禁止ファイルは見つかりませんでした。"
else
  echo "⚠️  検証失敗: 上記のファイルを修正してください。"
fi

exit $EXIT_CODE
