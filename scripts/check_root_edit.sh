#!/bin/bash
# scripts/check_root_edit.sh
# Claude Code の PreToolUse フックから呼ばれる（Edit/Write 実行前）
# ルートリポジトリの保護ブランチで直接ファイル編集しようとした際にブロックする

TOPLEVEL=$(git rev-parse --show-toplevel 2>/dev/null)
CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null)

# show-toplevel/.git がディレクトリ → ルートリポジトリ
# show-toplevel/.git がファイル    → git worktree（ブロックしない）
if [ -d "$TOPLEVEL/.git" ] && { [ "$CURRENT_BRANCH" = "develop" ] || [ "$CURRENT_BRANCH" = "main" ]; }; then
  # stdin から編集対象ファイルパスを取得
  INPUT=$(cat)
  FILE_PATH=$(echo "$INPUT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('file_path', ''))" 2>/dev/null || true)

  # 絶対パスをリポジトリルートからの相対パスに変換
  if [ -n "$TOPLEVEL" ]; then
    FILE_PATH="${FILE_PATH#$TOPLEVEL/}"
  fi

  # .planning/ / .specify/ / scripts/ 配下は develop での直接編集を許可
  if echo "$FILE_PATH" | grep -qE '^(\.planning|\.specify|scripts)/'; then
    exit 0
  fi

  echo "❌ ルートリポジトリの '$CURRENT_BRANCH' ブランチを直接編集できません。"
  echo "   先にワークツリーを作成してください:"
  echo "   sh scripts/setup_worktree.sh feat/your-feature-name"
  exit 2
fi
