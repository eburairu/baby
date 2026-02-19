# AI協調開発ワークフロー（Claude Code + Gemini CLI）

## 1. 概要

本ドキュメントは、Claude Code（主実装エンジン）と Gemini CLI（補助ツール）を組み合わせて開発効率を最大化するためのワークフローを定義する。

## 2. 役割分担

### 2.1 Claude Code: 「設計・実装の主担当」
- **責任範囲**: 要件定義、設計、実装、テスト、コミット、PR作成、コードレビュー
- **成果物**: `.specify/specs/` 配下の仕様書、実装コード、Pull Request
- **利用シーン**:
    - ゼロからの新機能設計・実装
    - バグの根本原因分析と修正
    - ワークツリーの管理・Git操作・PR作成
    - コードレビューへの対応

### 2.2 Gemini CLI: 「大量テキスト処理の補助担当」
- **責任範囲**: 大量テキストの読み込み・要約、ログ解析、ウェブ検索
- **利用シーン**:
    - 膨大なログやファイルの一括分析（Claude の context 節約）
    - 最新ライブラリのドキュメントや外部情報の調査
    - 差分や長い出力の要約

> Gemini CLI の呼び出しは Claude Code の `gemini`・`gemini-search`・`gemini-review` スキルを使用する。

## 3. 開発プロセス

### ステップ1: 設計フェーズ (Claude Code)
1. 機能の詳細な仕様書を `.specify/specs/` に作成・更新する。
2. 仕様書には「何を作るか」「既存のどのファイルを参考にするか」「どのようなテストが必要か」を明記する。
3. `develop` の最新コミットを確認し、実装予定の機能が既にマージされていないかチェックする。

```bash
git fetch origin develop
git log origin/develop --oneline -15
```

### ステップ2: 準備フェーズ (Claude Code)
1. `sh scripts/setup_worktree.sh <branch-name>` を実行し、開発用ワークツリーを作成する。
2. `worktrees/<branch-name>` に移動して作業を開始する。

```bash
sh scripts/setup_worktree.sh feat/xxx
cd worktrees/feat/xxx
```

### ステップ3: 実装フェーズ (Claude Code)
1. 仕様書に基づき実装を行う（Python: 型ヒント必須 / TypeScript: strict モード）。
2. 長時間作業では定期的に `develop` を取り込む。

```bash
git fetch origin develop && git merge origin/develop
```

### ステップ4: 検証フェーズ (Claude Code)
PR 作成前に必ず `verify_all.sh` を実行し、**全チェックが通ることを確認する**。

```bash
sh scripts/verify_all.sh
```

このスクリプトが実行する内容（順番に）:
1. `check_staged_files.sh` — `.venv`/`node_modules` の誤コミット防止
2. `pytest` — バックエンドユニットテスト
3. `python scripts/export_openapi.py` — OpenAPI スキーマ更新
4. `pnpm types:generate` — TypeScript 型生成
5. `pnpm lint` — フロントエンド Lint
6. `pnpm build` — フロントエンドビルド（型エラーも検出）

> エラーが発生した場合は修正してから再実行する。

### ステップ5: 完了フェーズ (Claude Code)
1. ステージング内容を個別ファイルで指定してコミットする（`git add -A` / `git add .` は禁止）。
2. `develop` を取り込んでからプッシュする。
3. PR を作成する。

```bash
# develop の最新を取り込む
git fetch origin develop && git merge origin/develop

# コミット（個別ファイル指定）
git add <ファイル名>
git status  # 禁止ファイルが含まれていないか確認
git commit -m "feat: 説明（日本語）"

# プッシュ & PR 作成
git push -u origin <branch-name>
gh pr create --base develop --title "feat: タイトルを日本語で" --body "..."
```

## 4. よく使うコマンド集

### 調査・分析（Gemini CLI 活用）
```bash
# 長大なログ・ファイルの要約
gemini "このエラーログを解析して原因を特定して: $(cat server.log)"

# 最新ライブラリ情報の調査
# → Claude Code の gemini-search スキルを使用
```

### 検証（Claude Code で実行）
```bash
# 全チェック一括実行
sh scripts/verify_all.sh

# 個別実行
npm run test:backend          # pytest のみ
npm run test:frontend         # vitest のみ
cd frontend && pnpm build     # ビルドのみ
python scripts/export_openapi.py  # スキーマ更新のみ
```

### Git 操作
```bash
# ステージング前の禁止ファイルチェック
sh scripts/check_staged_files.sh

# PR 作成（develop ブランチ必須）
gh pr create --base develop --title "feat: タイトル" --body "..."
```

## 5. コミット規約

- **形式**: `種別: 説明（日本語）`
- **種別は英語**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:` 等
- **説明は日本語**
- 例: `feat: ヘッダーに通知センターを追加`

## 6. 禁止事項

| 禁止 | 代替 |
|---|---|
| `git add -A` / `git add .` | `git add <ファイル名>` で個別指定 |
| `*.pem`, `*.key`, `*.cert` のコミット | 環境変数で管理 |
| `.venv`, `node_modules` シンボリックリンクのコミット | `git status` で確認して除外 |
| `develop` を飛ばして `main` に直接PR | 必ず `--base develop` |
| `develop` → `main` のマージをエージェントが実行 | ユーザーが判断・実行 |
