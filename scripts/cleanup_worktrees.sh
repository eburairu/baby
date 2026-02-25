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

# 一時ファイルの削除（ルートおよび全ワークツリー）
echo "🗑️ 一時的な PR body ファイル（pr_body*.md）を削除しています..."
find . -name "pr_body*.md" -type f -delete 2>/dev/null || true

# メインのワークツリー（ルート）以外のワークツリーを取得（ネストしたものを先に消せるよう逆順にソート）
WORKTREES=$(git worktree list --porcelain | grep "^worktree " | awk '{print $2}' | tail -n +2 | sort -r)

if [ -z "$WORKTREES" ]; then
    echo "✅ 削除対象のワークツリーはありません。"
else
    echo "🔍 ワークツリーの確認を開始します..."
    for wt_path in $WORKTREES; do
        # ワークツリーのディレクトリが存在するか確認
        if [ ! -d "$wt_path" ]; then
            echo "⚠️  $wt_path は実在しません。登録を削除します..."
            git worktree prune
            continue
        fi

        # ワークツリーに関連付けられているブランチ名を取得
        branch=$(git -C "$wt_path" rev-parse --abbrev-ref HEAD)
        
        echo "チェック $branch ($wt_path)..."
        
        # 削除条件の判定
        is_merged_main=$(git merge-base --is-ancestor "$branch" origin/main 2>/dev/null && echo "true" || echo "false")
        is_merged_develop=$(git merge-base --is-ancestor "$branch" origin/develop 2>/dev/null && echo "true" || echo "false")
        
        local_hash=$(git rev-parse "$branch" 2>/dev/null || echo "local_missing")
        remote_hash=$(git rev-parse "origin/$branch" 2>/dev/null || echo "remote_missing")
        is_synced=$([ "$local_hash" = "$remote_hash" ] && [ "$local_hash" != "local_missing" ] && echo "true" || echo "false")

        if [ "$is_merged_main" = "true" ] || [ "$is_merged_develop" = "true" ]; then
            echo "✨ $branch はマージ済みです。削除します..."
            git worktree remove --force "$wt_path"
            git branch -d "$branch" 2>/dev/null || true
        elif [ "$is_synced" = "true" ]; then
            echo "☁️  $branch は未マージですがリモートと同期済みです。安全に削除します..."
            git worktree remove --force "$wt_path"
            # 同期済みなのでローカルブランチも削除（未マージのため -D が必要）
            git branch -D "$branch" 2>/dev/null || true
        else
            echo "⏳ $branch は未マージで、ローカルにのみ変更があります。維持します。"
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
