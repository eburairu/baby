#!/bin/bash
# scripts/check_commit_msg.sh
# コミットメッセージの禁止パターンをチェックする
# 使い方: sh scripts/check_commit_msg.sh <commit-msg-file>

COMMIT_MSG_FILE="${1:-.git/COMMIT_EDITMSG}"
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# "Closes #0" / "Fixes #0" / "Resolves #0" 等の無効な issue 参照を禁止
# semantic-release が #0 を解釈して GitHub API エラーになるため
if echo "$COMMIT_MSG" | grep -qiE '(closes|fixes|resolves|refs?) #0\b'; then
  echo "❌ コミットメッセージに無効な issue 参照 '#0' が含まれています。"
  echo "   実際の issue 番号を指定するか、'Closes #0' を削除してください。"
  exit 1
fi

exit 0
