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

# 0. 最新のコードをフェッチ
echo "Fetching latest changes from origin..."
git fetch origin "$BASE_BRANCH"

# ============================================================
# ⚠️  重複実装チェック（必須）
# ============================================================
# 作業開始前に、実装予定の機能が develop に既に含まれていないか
# 必ず以下のログを確認すること。
# 同一・類似の機能が既にマージされていた場合は、
# 既存コードを拡張する方針に切り替え、ゼロから実装しないこと。
echo ""
echo "========================================"
echo "⚠️  ${BASE_BRANCH} の最新 15 コミット（必ず確認）"
echo "========================================"
git log "origin/${BASE_BRANCH}" --oneline -15
echo "========================================"
echo "実装予定の機能が上記に含まれていないか確認してください。"
echo "含まれている場合は既存コードを拡張し、重複実装しないこと。"
echo "========================================"
echo ""

# 1. ワークツリーの作成
echo "Creating worktree for $BRANCH_NAME at $WORKTREE_DIR..."
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "Branch $BRANCH_NAME already exists. Using existing branch."
  git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"
else
  echo "Creating new branch $BRANCH_NAME from origin/$BASE_BRANCH."
  git worktree add "$WORKTREE_DIR" -b "$BRANCH_NAME" "origin/$BASE_BRANCH"
fi

# 2. 依存関係の共有（シンボリックリンク作成）
# 絶対パスを使用することで、ブランチ名にスラッシュが含まれるか否かに関わらず
# 正しいリンクが作成される（相対パスはディレクトリ深度に依存するため不使用）
# pwd ではなく git rev-parse --show-toplevel でリポジトリルートを取得することで
# スクリプトをサブディレクトリから呼び出した場合も正しく動作する
echo "Setting up symlinks for shared dependencies..."
ROOT_DIR="$(git rev-parse --show-toplevel)"

# Python venv
ln -sf "$ROOT_DIR/.venv" "$WORKTREE_DIR/.venv"

# Root node_modules
ln -sf "$ROOT_DIR/node_modules" "$WORKTREE_DIR/node_modules"

# .env (Database settings)
ln -sf "$ROOT_DIR/.env" "$WORKTREE_DIR/.env"


# Frontend node_modules（絶対パスで作成して Turbopack のシンボリックリンク問題を回避）
if [ -d "$WORKTREE_DIR/frontend" ]; then
  FRONTEND_NM="$ROOT_DIR/frontend/node_modules"
  ln -sf "$FRONTEND_NM" "$WORKTREE_DIR/frontend/node_modules"
fi

# 3. ワークツリーの .git ファイルを解決して pre-commit hook をインストール
# git worktree の .git は通常ファイル（"gitdir: ..."）なので、実際のパスを取得する
WORKTREE_GIT_DIR=$(git -C "$WORKTREE_DIR" rev-parse --git-dir 2>/dev/null)
if [ -n "$WORKTREE_GIT_DIR" ]; then
  # 相対パスの場合は絶対パスに変換
  if [[ "$WORKTREE_GIT_DIR" != /* ]]; then
    WORKTREE_GIT_DIR="$WORKTREE_DIR/$WORKTREE_GIT_DIR"
  fi
  sh "$ROOT_DIR/scripts/install_hooks.sh" "$WORKTREE_GIT_DIR"
fi

echo ""
echo "Worktree setup complete!"
echo ""
echo "📋 作業中の develop 同期リマインダー:"
echo "  - 長時間作業時は定期的に: git merge origin/${BASE_BRANCH}"
echo "  - PR 作成前に必ず: git fetch origin ${BASE_BRANCH} && git merge origin/${BASE_BRANCH}"
echo "  - PR 作成前の全チェック: sh scripts/verify_all.sh"
echo ""
echo "To start working, run: cd $WORKTREE_DIR"
