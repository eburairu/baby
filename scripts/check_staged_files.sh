#!/bin/bash

# scripts/check_staged_files.sh
# コミット対象（ステージング済み）のファイルに禁止ファイルが含まれていないかチェックする

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
