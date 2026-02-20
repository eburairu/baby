## 概要
AI エージェントが PR 作成時にシェルエスケープの問題で本文が崩れるのを防ぐため、一時ファイルを経由して安全に PR を作成するスクリプトを導入しました。また、各ガイドラインと仕様書を更新し、このスクリプトの使用を義務付けました。

## 変更内容
- **scripts/create_pr.py**: 
  - Python で作成された PR 作成・編集ユーティリティ。
  - 一時ファイルを経由して `gh pr create` / `gh pr edit` を実行。
  - 標準入力からの本文受け取りに対応。
- **GEMINI.md / CLAUDE.md**: 
  - PR 作成時の注意点を追記し、`scripts/create_pr.py` の使用を義務付け。
- **.specify/specs/development/git_worktree_workflow.md**: 
  - 開発フローに安全な PR 作成手順を組み込み。

## 解決する課題
- PR 本文内の改行がリテラルの `\n` として表示されてしまう問題の解消。
- `Closes #XXX` 等のキーワードがシェルエスケープによって GitHub に正しく認識されない問題の解消。

Closes #195
