#!/bin/bash
# scripts/install_hooks.sh
# Git pre-commit hook をインストールする
# 使い方: sh scripts/install_hooks.sh [<git-dir>]
#
# <git-dir> を指定しない場合はカレントディレクトリの .git を使用する。
# git worktree 内では GIT_DIR 環境変数が自動設定されているため、
# setup_worktree.sh から呼ぶ場合は明示的に渡す。

GIT_DIR_PATH="${1:-$(git rev-parse --git-dir 2>/dev/null)}"

if [ -z "$GIT_DIR_PATH" ]; then
  echo "Error: .git ディレクトリが見つかりません。"
  exit 1
fi

HOOKS_DIR="$GIT_DIR_PATH/hooks"
HOOK_FILE="$HOOKS_DIR/pre-commit"

# プロジェクトルートへの相対パスを計算（hook は git-dir 基準で実行されないため絶対パスを使用）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CHECK_SCRIPT="$SCRIPT_DIR/check_staged_files.sh"
CHECK_OPENAPI_SCRIPT="$SCRIPT_DIR/check_openapi_hook.sh"
CHECK_COMMIT_MSG_SCRIPT="$SCRIPT_DIR/check_commit_msg.sh"

if [ ! -f "$CHECK_SCRIPT" ]; then
  echo "Error: $CHECK_SCRIPT が見つかりません。"
  exit 1
fi

if [ ! -f "$CHECK_OPENAPI_SCRIPT" ]; then
  echo "Error: $CHECK_OPENAPI_SCRIPT が見つかりません。"
  exit 1
fi

if [ ! -f "$CHECK_COMMIT_MSG_SCRIPT" ]; then
  echo "Error: $CHECK_COMMIT_MSG_SCRIPT が見つかりません。"
  exit 1
fi

mkdir -p "$HOOKS_DIR"

cat > "$HOOK_FILE" <<EOF
#!/bin/bash
# pre-commit hook: ステージング済みファイルの自動チェック
sh "$CHECK_SCRIPT"
sh "$CHECK_OPENAPI_SCRIPT"
# lint は CI (validate-frontend-build) で実施 → pre-commit からは除外
EOF

chmod +x "$HOOK_FILE"
echo "✅ pre-commit hook をインストールしました: $HOOK_FILE"

# commit-msg フック
COMMIT_MSG_HOOK_FILE="$HOOKS_DIR/commit-msg"
cat > "$COMMIT_MSG_HOOK_FILE" <<EOF
#!/bin/bash
# commit-msg hook: コミットメッセージの禁止パターンをチェック
sh "$CHECK_COMMIT_MSG_SCRIPT" "\$1"
EOF

chmod +x "$COMMIT_MSG_HOOK_FILE"
echo "✅ commit-msg hook をインストールしました: $COMMIT_MSG_HOOK_FILE"
