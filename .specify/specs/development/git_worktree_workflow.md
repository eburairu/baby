# Git Worktree 開発フロー仕様書

## 概要

本ドキュメントは、Baby App プロジェクトにおける `git worktree` を活用した開発フローの仕様を規定する。このフローは、AI エージェント（Gemini CLI, Claude Code, Antigravity）および人間の開発者が、ブランチごとに独立したディレクトリで作業し、マルチタスクを円滑に進めることを目的とする。

## ディレクトリ構造

作業ディレクトリは、プロジェクトのルートにある `worktrees/` 配下に作成する。

```text
/Users/ry1e/Documents/work/baby/
├── .venv/ (Python 仮想環境)
├── node_modules/ (ルート node_modules)
├── frontend/node_modules/ (フロントエンド node_modules)
├── .env (データベース接続設定)
├── scripts/setup_worktree.sh (セットアップスクリプト)
└── worktrees/
    ├── feat/issue-101/ (ブランチごとの独立ディレクトリ)
    ├── fix/bug-202/
    └── ...
```

※ `worktrees/` は `.gitignore` によって管理対象外とされる。

## セットアップ手順

新しいブランチで開発を開始する際は、必ず `./scripts/setup_worktree.sh` を使用して環境を構築する。

### 0. 【必須】作業開始前の重複実装チェック

> **この手順を省略すると、develop にマージ済みの機能を重複実装してコンフリクトを招く。**

`setup_worktree.sh` は `develop` の最新 15 コミットを表示するので、**実装予定の機能が既に含まれていないか必ず確認する**。

```bash
# スクリプト実行前に手動確認する場合
git fetch origin develop
git log origin/develop --oneline -15
```

確認事項：
- 実装予定と同一・類似のコミットメッセージがないか
- 実装予定のファイル（モデル、ルーター、コンポーネント）が既に存在しないか

既に実装されていた場合は **既存コードを拡張** する方針に切り替え、ゼロから実装しない。

### 1. ワークツリーの作成

```bash
./scripts/setup_worktree.sh <branch-name> [<base-branch>]
```

このスクリプトは以下の処理を自動的に行う：
1. `git fetch origin develop` で最新化してから最新 15 コミットを表示（重複チェック用）。
2. `git worktree add` を実行（`origin/develop` の最新コミットから分岐）。
3. メインディレクトリから以下の共有リソースへのシンボリックリンクを作成：
   - `.venv` -> `../../../.venv`
   - `node_modules` -> `../../../node_modules`
   - `.env` -> `../../../.env`
   - `frontend/node_modules` -> 絶対パスで作成（Turbopack シンボリックリンク問題を回避）

### 2. 依存関係の確定

シンボリックリンクの設定後、必要に応じて各ワークツリー内で以下のコマンドを実行し、環境を確定させる。特に Turbopack を使用したビルドを行う場合、シンボリックリンクが制限されることがあるため、ワークツリー内での `pnpm install` が推奨される。

```bash
cd worktrees/<branch-name>/frontend
pnpm install
```

## 開発サイクル

1. **開始**: 開発者はメインディレクトリ（`develop` ブランチ）で `scripts/setup_worktree.sh` を実行。
2. **実装・検証**: `worktrees/<branch-name>` 内でコードの修正、ビルド、テストを実施。
3. **コミット**: ワークツリー内で変更をステージ・コミット。
4. **PR 作成**: リモートにプッシュし、`develop` ブランチへの PR を作成する。

```bash
git push -u origin <branch-name>
gh pr create --base develop --head <branch-name> --title "<type>: <description>" --body "<details>"
```

5. **クリーンアップ**: PR 作成後、ワークツリーとローカルブランチを削除。

```bash
# クリーンアップコマンド（メインディレクトリで実行）
git worktree remove --force worktrees/<branch-name>
git branch -D <branch-name>
```

## 注意点

- **共有リソースの変更**: `.env` や `.venv`、`node_modules` の内容は全ワークツリーで共有されるため、依存パッケージの追加や環境変数の変更は慎重に行うこと。
- **シンボリックリンクのコミット禁止**: `setup_worktree.sh` が作成する `.venv` や `node_modules` などのシンボリックリンクは、**絶対にコミットに含めないこと**。`git add .` を実行する前に `git status` を確認し、これらのリンクが `new file:` としてリストされていないかチェックすること。もし含まれている場合は、`git rm --cached <link>` で除外するか、個別にファイルを指定して `git add` すること。
- **Turbopack の制限**: Turbopack を使用した `next build` では、`node_modules` がプロジェクトルート外にあることを許容しない場合がある。その際は、ワークツリー内の `frontend` ディレクトリで `pnpm install` を実行し、ローカルに `node_modules` を構築すること（`pnpm` のハードリンク機能によりディスク消費は最小限に抑えられる）。
- **クリーンアップ**: 作業完了後は、ディスク容量節約と Git 管理の簡素化のため、速やかに `git worktree remove` を実行すること。

## AI エージェントへの適用

Gemini CLI および Claude Code などのエージェントは、`GEMINI.md` および `CLAUDE.md` に記載されたルールに従い、常にこのワークツリーフローを使用してタスクを遂行する。

## 自律的エージェントワークフロー (Autonomous Agent Workflow)

AI エージェントは、特定のタスク（Directive）を受けた際、以下のステップを自律的に実行して PR 作成までを完遂させる。

1. **環境構築**:
   - `sh scripts/setup_worktree.sh <branch-name>` を実行。
   - `worktrees/<branch-name>` に移動。
   - `cd frontend && pnpm install` を実行し、環境を確定させる。

2. **実装と内部検証**:
   - 仕様（SDD）に基づいた実装を行う。
   - [ローカル環境動作確認仕様書](./local_verification.md) に規定された標準の検証手順を実行し、全て成功することを確認する。
     - ユニットテスト（Backend/Frontend）の実行。
     - フロントエンドのビルド (`pnpm build`) とリンター (`pnpm lint`) の実行。

3. **プルリクエストの作成**:
   - 作業が完了し、検証が成功したことを確認後、GitHub CLI (`gh`) を使用して `develop` ブランチに対する PR を作成する。
   - まず変更をリモートにプッシュする: `git push -u origin <branch-name>`
   - PR を作成する: `gh pr create --base develop --head <branch-name> --title "<type>: <description>" --body "<details>"`

4. **仕様との整合性確認 (Review)**:
   - **【重要】ワークツリーを削除する前**に、必ず `spec-checker` サブエージェントを呼び出し、実装内容が仕様（`.specify/specs/`）と矛盾していないか、また実装プラン通りに完了しているかの最終レビューを受ける。
   - レビューで指摘事項がある場合は、ワークツリー内で修正・追加コミットを行い、再度 PR を更新する。

5. **事後処理**:
   - PR 作成および `spec-checker` による最終確認の完了後、メインディレクトリに戻る。
   - ワークツリーを削除する: `git worktree remove --force worktrees/<branch-name>`
   - ローカルブランチを削除する: `git branch -D <branch-name>`
   - 最終的な PR の URL を報告してタスクを完了とする。

※ エージェントは、これらの一連の操作においてユーザーの許可確認を最小限にし、自律的に完遂することが期待される。
