---
name: cleanup-worktrees
description: マージ済みワークツリーとローカルブランチをクリーンアップする
allowed-tools:
  - Bash
---

以下の手順でワークツリーのクリーンアップを実行してください。

1. まず現在のブランチを確認する:
   ```bash
   git rev-parse --abbrev-ref HEAD
   ```

2. develop または main ブランチにいない場合は、develop に切り替える:
   ```bash
   git checkout develop
   ```

3. クリーンアップスクリプトを実行する:
   ```bash
   sh scripts/cleanup_worktrees.sh
   ```

4. 完了したら結果を報告する。
