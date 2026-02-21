#!/bin/bash

# scripts/cleanup_worktrees.sh
# マージ済みのワークツリーとローカルブランチを自動でクリーンアップするスクリプト

set -e

echo "🔄 ブランチの状態を最新に更新しています..."
git fetch origin main develop --quiet

# メインのワークツリー（ルート）以外のワークツリーを取得
WORKTREES=$(git worktree list --porcelain | grep "^worktree " | awk '{print $2}' | tail -n +2)

if [ -z "$WORKTREES" ]; then
    echo "✅ 削除対象のワークツリーはありません。"
else
    echo "🔍 ワークツリーの確認を開始します..."
    for wt_path in $WORKTREES; do
        # ワークツリーに関連付けられているブランチ名を取得
        branch=$(git -C "$wt_path" rev-parse --abbrev-ref HEAD)
        
        echo "检查 $branch ($wt_path)..."
        
        # origin/main にマージされているか確認
        if git merge-base --is-ancestor "$branch" origin/main 2>/dev/null; then
            echo "✨ $branch は origin/main にマージ済みです。削除します..."
            git worktree remove "$wt_path"
            # 関連するローカルブランチも削除（マージ済みなので -d で安全に削除可能）
            git branch -d "$branch"
        else
            echo "⏳ $branch はまだマージされていません。維持します。"
        fi
    done
fi

echo "🧹 マージ済みの孤立したローカルブランチをクリーンアップしています..."
# main, develop, および現在チェックアウト中のブランチ以外のマージ済みブランチを削除
MERGED_BRANCHES=$(git branch --merged origin/main | grep -vE '^\*|main|develop' || true)

if [ -n "$MERGED_BRANCHES" ]; then
    echo "$MERGED_BRANCHES" | xargs git branch -d
    echo "✅ マージ済みブランチを削除しました。"
else
    echo "✅ 削除対象の孤立ブランチはありません。"
fi

# 空になった worktrees/ 配下のディレクトリを整理
find worktrees -type d -empty -delete 2>/dev/null || true

echo "🎉 クリーンアップが完了しました。"
