#!/bin/bash

# scripts/cleanup_worktrees.sh
# マージ済みのワークツリーとローカルブランチを自動でクリーンアップするスクリプト

set -e

# 安全チェック: ルートディレクトリの develop または main ブランチにいるか確認
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ ! -d ".git" ]; then
    echo "❌ エラー: このスクリプトはメインリポジトリのルートディレクトリから実行してください。"
    exit 1
fi

if [[ "$CURRENT_BRANCH" != "develop" && "$CURRENT_BRANCH" != "main" ]]; then
    echo "❌ エラー: クリーンアップは develop または main ブランチに切り替えてから実行してください（現在のブランチ: $CURRENT_BRANCH）。"
    exit 1
fi

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
        
        echo "チェック $branch ($wt_path)..."
        
        # origin/main または origin/develop にマージされているか確認
        if git merge-base --is-ancestor "$branch" origin/main 2>/dev/null || \
           git merge-base --is-ancestor "$branch" origin/develop 2>/dev/null; then
            echo "✨ $branch はマージ済みです。削除します..."
            git worktree remove --force "$wt_path"
            # 関連するローカルブランチも削除（マージ済みなので -d で安全に削除可能）
            git branch -d "$branch"
        else
            echo "⏳ $branch はまだマージされていません。維持します。"
        fi
    done
fi

echo "🧹 マージ済みの孤立したローカルブランチをクリーンアップしています..."
# main, develop, および現在チェックアウト中のブランチ以外のマージ済みブランチを削除
# origin/main または origin/develop のいずれかにマージされているものを対象とする
MERGED_BRANCHES=$( (git branch --merged origin/main; git branch --merged origin/develop) | grep -vE '^\*|main|develop' | sort -u || true)

if [ -n "$MERGED_BRANCHES" ]; then
    echo "$MERGED_BRANCHES" | xargs git branch -d
    echo "✅ マージ済みブランチを削除しました。"
else
    echo "✅ 削除対象の孤立ブランチはありません。"
fi

# 空になった worktrees/ 配下のディレクトリを整理
find worktrees -type d -empty -delete 2>/dev/null || true

echo "🎉 クリーンアップが完了しました。"
