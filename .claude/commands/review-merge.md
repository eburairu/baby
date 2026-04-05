---
name: review-merge
description: developブランチをmainにマージする前の安全性レビュー。差分確認・全テスト実行・コードレビューを行い、マージ可否を判定する。
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - Agent
---

`develop` → `main` マージ前の安全性レビューを実施します。

## ステップ 1: 差分の把握

```bash
git fetch origin
git log origin/main..origin/develop --oneline
```

コミット一覧を確認し、レビュー対象の変更範囲を把握する。

```bash
git diff origin/main...origin/develop --stat
```

変更ファイル一覧を取得する。

## ステップ 2: 自動チェック実行

`verify_all.sh` は worktree 外の保護ブランチでは実行できないため、各チェックを個別に実行する。

```bash
source .venv/bin/activate && set -a && source .env && set +a
```

### 2a. Alembic head チェック

```bash
alembic heads 2>&1 | grep "(head)" | wc -l
```

1 以外なら複数 head が存在するため **マージ不可**。

### 2b. バックエンドテスト

```bash
.venv/bin/python -m pytest tests/ -q 2>&1
```

失敗があれば **マージ不可**。

### 2c. OpenAPI スキーマ最新性チェック

```bash
.venv/bin/python scripts/export_openapi.py
git diff frontend/openapi.json
```

差分が出た場合は openapi.json が古いため **マージ不可**（`git checkout frontend/openapi.json` で元に戻す）。

### 2d. フロントエンド型生成・ビルド

```bash
cd frontend
pnpm types:generate
pnpm build 2>&1
cd ..
```

失敗があれば **マージ不可**。

## ステップ 3: 差分のコードレビュー

```bash
git diff origin/main...origin/develop
```

差分全体を取得し、以下の観点でレビューする:

### チェックリスト

**セキュリティ**
- [ ] SQLインジェクション・XSS・認証バイパスの恐れがないか
- [ ] 秘密鍵・トークン等がハードコードされていないか
- [ ] 新規エンドポイントに適切な認証ガードがあるか（`get_current_user` / `verify_baby_access`）

**データ整合性**
- [ ] Alembicマイグレーションが追加されている場合、ロールバック手順が存在するか
- [ ] 論理削除・カスケード削除の影響範囲が正しいか

**API 互換性**
- [ ] `openapi.json` がバックエンド変更と一致しているか
- [ ] フロントエンドの型定義と乖離していないか

**テストカバレッジ**
- [ ] 新機能・バグ修正にテストが付いているか
- [ ] テストがモックに依存しすぎていないか（実DBを使うべき箇所）

**コード品質**
- [ ] 過度なエラーハンドリングや不要な抽象化がないか
- [ ] N+1クエリや明らかなパフォーマンス問題がないか

## ステップ 4: 最終判定

以下のフォーマットで結果を報告する:

```
## マージレビュー結果

### 変更サマリー
- コミット数: N件
- 変更ファイル: N件（追加N / 変更N / 削除N）

### テスト結果
✅ verify_all.sh: 全ステップ通過  （または ❌ 失敗ステップ）

### コードレビュー
（問題点があれば箇条書きで記載。問題なければ「指摘事項なし」）

### 判定
✅ マージ可  （または ❌ マージ不可: 理由）
```

マージ可の場合でもユーザーが `develop → main` のマージを実行するまでは何もしない（エージェントは自動マージしない）。
