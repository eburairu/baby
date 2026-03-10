---
name: implement-issue
description: auto-audit issueをGemini CLIで自動実装してPRを作成する。引数なしで最高優先度issueを自動選択。--claudeオプションでClaude Code自身が実装。
argument-hint: "[issue_number] [--claude]"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

$ARGUMENTS に `--claude` が含まれている場合は **Claude実装モード** で動作します。
それ以外は Gemini CLIで実装します。

---

## Gemini実装モード（デフォルト）

`--claude` が含まれていない場合:

```bash
bash scripts/implement_issue.sh $ARGUMENTS
```

完了したらPR URLをユーザーに報告してください。
エラーが発生した場合はエラー内容を報告してください。

---

## Claude実装モード（`--claude` が指定された場合）

`--claude` を除いたissue番号（あれば）を `ISSUE_ARG` として以下を実行してください。

### ステップ1: セットアップ

```bash
bash scripts/implement_issue.sh --setup-only ISSUE_ARG
```

出力の `---IMPL_INFO_START---` ～ `---IMPL_INFO_END---` の間にある情報（WORKTREE_DIR, BRANCH_NAME, ISSUE_NUMBER, ISSUE_TYPE, ISSUE_TITLE, ISSUE_BODY）を読み取ります。

### ステップ2: Claude自身による実装

以下の手順をworktreeディレクトリ（WORKTREE_DIR）で実施してください。

1. `.specify/specs/` 配下の関連仕様書を確認する
2. **テストを先に書く（TDD）**
   - backend変更: `tests/` 配下にpytestテストを追加
   - frontend変更: `frontend/src` 配下に `__tests__` ディレクトリを作成しJestテストを追加
   - テストを実行してRedであることを確認
3. 最小限の変更で実装し、テストをGreenにする
4. `app/models/`, `app/schemas/`, `app/routers/` を変更した場合:
   ```bash
   cd WORKTREE_DIR && python scripts/export_openapi.py && git add frontend/openapi.json
   ```
5. 全チェック実行:
   ```bash
   cd WORKTREE_DIR && sh scripts/verify_all.sh
   ```
   - 失敗した場合は原因を特定して修正し、再度実行する
6. コミット:
   ```bash
   cd WORKTREE_DIR && git commit -m "ISSUE_TYPE: #ISSUE_NUMBER <日本語の説明>

Closes #ISSUE_NUMBER"
   ```

**制約**: 関係ないコードの改変禁止。verify_all.sh が通るまでコミットしない。git push / PR作成はしない（次のステップで行う）。

### ステップ3: Push + PR作成

```bash
bash scripts/implement_issue.sh --finish BRANCH_NAME
```

出力された `PR_URL=...` の値をユーザーに報告してください。
