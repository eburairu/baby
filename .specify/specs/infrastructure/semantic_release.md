# Semantic Release 導入仕様書

## 背景

`semantic-release` を使用して、バージョン管理とパッケージの公開を自動化します。
開発は「仕様駆動開発（Specification-Driven Development）」のルールに従って行います。

## 目標

- Conventional Commits に基づいたバージョンの自動バンプ。
- CHANGELOG.md の自動生成。
- GitHub Releases の作成。
- `package.json` のバージョン自動更新。

## スコープ

- 設定対象: ルートディレクトリ。
- CI/CD: GitHub Actions。
- 対象ブランチ: `main`。

## 要件

### 1. 依存関係

ルートディレクトリの `package.json` に以下の devDependencies をインストールします:

- `semantic-release`
- `@semantic-release/changelog`
- `@semantic-release/git`
- `@semantic-release/github`
- `@semantic-release/npm`
- `conventional-changelog-conventionalcommits`

### 2. 設定 (`.releaserc.json`)

- **ブランチ**: `['main']`
- **プラグイン構成**:
  1. `@semantic-release/commit-analyzer`: コミット内容を解析して次期バージョンを決定。
  2. `@semantic-release/release-notes-generator`: リリースノートの生成。
  3. `@semantic-release/changelog`: `CHANGELOG.md` の更新。
  4. `@semantic-release/npm`: `package.json` のバージョン更新（プライベートアプリの場合は npm publish を無効化）。
  5. `@semantic-release/git`: `package.json` と `CHANGELOG.md` をコミット。
  6. `@semantic-release/github`: GitHub へリリースを公開。

### 3. CI/CD (`.github/workflows/release.yml`)

- トリガー: `main` ブランチへのプッシュ。
- 環境変数: `GITHUB_TOKEN`。
- 権限: `contents: write`, `issues: write`, `pull-requests: write`。

### 4. デプロイ制御 (Render)

`semantic-release` によるコミットとマージ時の重複デプロイを避けるため、以下の設定を行います。

- `render.yaml`: `autoDeploy: false` を設定。
- `.github/workflows/release.yml`: リリース成功後に Render の `DEPLOY_HOOK_URL` を呼び出してデプロイをトリガーする。

## 検証

- ローカルで `npx semantic-release --dry-run` を実行し（GITHUB_TOKENを設定した状態で）、設定が正しいか検証する。
- dry-run の出力で changelog が生成されるか確認する。
