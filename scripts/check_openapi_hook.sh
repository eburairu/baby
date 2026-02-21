#!/bin/bash
# Stopフック: バックエンドファイルが変更されている場合に openapi.json の更新を促す
cd /Users/ry1e/Documents/work/baby

STAGED=$(git diff --cached --name-only 2>/dev/null)
UNSTAGED=$(git diff --name-only 2>/dev/null)
ALL_CHANGES="$STAGED
$UNSTAGED"

if echo "$ALL_CHANGES" | grep -qE "app/(models|schemas|routers)/"; then
  if ! echo "$ALL_CHANGES" | grep -q "frontend/openapi.json"; then
    echo "⚠️  バックエンドファイルが変更されています。openapi.json の更新を確認してください: npm run schema:generate"
  fi
fi
