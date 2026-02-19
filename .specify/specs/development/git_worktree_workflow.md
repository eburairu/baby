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

### 1. ワークツリーの作成

```bash
./scripts/setup_worktree.sh <branch-name> [<base-branch>]
```

このスクリプトは以下の処理を自動的に行う：
1. `git worktree add` を実行。
2. メインディレクトリから以下の共有リソースへのシンボリックリンクを作成：
   - `.venv` -> `../../../.venv`
   - `node_modules` -> `../../../node_modules`
   - `.env` -> `../../../.env`
   - `frontend/node_modules` -> `../../../../frontend/node_modules`

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
4. **マージ**: メインディレクトリに戻り、ワークツリーのブランチを `develop` にマージ。
5. **クリーンアップ**: ワークツリーを削除。

```bash
# クリーンアップコマンド（メインディレクトリで実行）
git worktree remove --force worktrees/<branch-name>
git branch -D <branch-name>
```

## 注意点

- **共有リソースの変更**: `.env` や `.venv`、`node_modules` の内容は全ワークツリーで共有されるため、依存パッケージの追加や環境変数の変更は慎重に行うこと。
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
   - ユニットテスト（Backend/Frontend）を追加・実行する。
   - フロントエンドのビルド (`pnpm build`) とリンター (`pnpm lint`) が通ることを確認する。

3. **プルリクエストの作成**:
   - 作業が完了し、検証が成功したことを確認後、GitHub CLI (`gh`) を使用して `develop` ブランチに対する PR を作成する。
   - まず変更をリモートにプッシュする: `git push -u origin <branch-name>`
   - PR を作成する: `gh pr create --base develop --head <branch-name> --title "<type>: <description>" --body "<details>"`

4. **事後処理**:
   - PR 作成の成功を確認後、メインディレクトリに戻る。
   - ワークツリーを削除する: `git worktree remove --force worktrees/<branch-name>`
   - ローカルブランチを削除する: `git branch -D <branch-name>`
   - 最終的な PR の URL を報告してタスクを完了とする。

※ エージェントは、これらの一連の操作においてユーザーの許可確認を最小限にし、自律的に完遂することが期待される。
