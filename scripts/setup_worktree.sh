#!/bin/bash

# scripts/setup_worktree.sh
# 使い方: sh scripts/setup_worktree.sh <branch-name> [<base-branch>]

BRANCH_NAME=$1
BASE_BRANCH=${2:-develop}

if [ -z "$BRANCH_NAME" ]; then
  echo "Error: Branch name is required."
  echo "Usage: sh scripts/setup_worktree.sh <branch-name> [<base-branch>]"
  exit 1
fi

WORKTREE_DIR="worktrees/$BRANCH_NAME"

# 1. ワークツリーの作成
echo "Creating worktree for $BRANCH_NAME at $WORKTREE_DIR..."
git worktree add "$WORKTREE_DIR" -b "$BRANCH_NAME" "$BASE_BRANCH"

# 2. 依存関係の共有（シンボリックリンク作成）
echo "Setting up symlinks for shared dependencies..."

# Python venv
ln -s ../../.venv "$WORKTREE_DIR/.venv"

# Root node_modules
ln -s ../../node_modules "$WORKTREE_DIR/node_modules"

# .env (Database settings)
ln -s ../../.env "$WORKTREE_DIR/.env"

# Frontend node_modules
# ディレクトリが存在することを確認してからリンクを張る
if [ -d "$WORKTREE_DIR/frontend" ]; then
  mkdir -p "$WORKTREE_DIR/frontend"
  ln -s ../../../frontend/node_modules "$WORKTREE_DIR/frontend/node_modules"
fi

echo "Worktree setup complete!"
echo "To start working, run: cd $WORKTREE_DIR"
