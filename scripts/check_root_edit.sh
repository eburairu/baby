#!/bin/bash
# scripts/check_root_edit.sh
# Claude Code の PreToolUse フックから呼ばれる（Edit/Write 実行前）
# ルートリポジトリの保護ブランチで直接ファイル編集しようとした際にブロックする

TOPLEVEL=$(git rev-parse --show-toplevel 2>/dev/null)
CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null)

# show-toplevel/.git がディレクトリ → ルートリポジトリ
# show-toplevel/.git がファイル    → git worktree（ブロックしない）
if [ -d "$TOPLEVEL/.git" ] && { [ "$CURRENT_BRANCH" = "develop" ] || [ "$CURRENT_BRANCH" = "main" ]; }; then
  echo "❌ ルートリポジトリの '$CURRENT_BRANCH' ブランチを直接編集できません。"
  echo "   先にワークツリーを作成してください:"
  echo "   sh scripts/setup_worktree.sh feat/your-feature-name"
  exit 2
fi
