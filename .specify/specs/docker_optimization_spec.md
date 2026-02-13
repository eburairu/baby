# Dockerfile Optimization Specification

## 1. 概要

現在の `Dockerfile` のビルド時間を短縮し、セキュリティおよびパフォーマンスのベストプラクティスを適用するための仕様を定義する。

## 2. 現状の課題

- **ビルドコンテキストの肥大化**: `.dockerignore` が存在しないため、`node_modules`, `.git`, `__pycache__` などの不要なファイルが Docker デーモンに転送されており、キャッシュの無効化や転送時間の増加を招いている。
- **キャッシュの非効率**: `pip install` や `npm install` 時に Docker BuildKit のキャッシュマウント機能を利用していないため、依存関係の再ダウンロードが発生しやすい。
- **イメージサイズとセキュリティ**: Python 環境のビルドツール（gcc など）がランタイムイメージに残る可能性がある（現在は一つのステージで完結している部分がある）。また、root ユーザーで実行されている。

## 3. 改善方針

### 3.1 ビルドコンテキストの最適化

- `.dockerignore` ファイルを作成し、以下のディレクトリ・ファイルを除外する。
    - `node_modules`
    - `frontend/node_modules`
    - `.next` (ローカルビルド分)
    - `frontend/.next`
    - `__pycache__`
    - `.git`
    - `.venv`
    - `*.db` (SQLite)
    - `.env` (シークレット混入防止)

### 3.2 Dockerfile の最適化

- **Frontend Stage**:
    - `npm ci` を使用して再現性を確保する。
    - `--mount=type=cache,target=/root/.npm` を使用して npm キャッシュを永続化する。
- **Backend Stage / Runtime Stage**:
    - **Builder Stage**: Python の依存ライブラリをビルドするためのステージを分離する。`gcc` などのビルドツールはこのステージのみに留める。
    - **Runtime Stage**:
        - `python:3.10-slim` をベースにする。
        - 必要なシステムライブラリ (`libpq-dev` 等) のみをインストールする。`apt-get` のキャッシュもマウントする。
        - Builder ステージからインストール済みのパッケージ、または `requirements.txt` から `--no-cache-dir` かつマウントキャッシュ付きでインストールする。
        - root 以外のユーザーを作成し、アプリケーションを実行する。

## 4. 検証基準

- `docker build .` が正常に完了すること。
- 再ビルド（ソースコード変更なし、および依存関係変更なし）が高速であること。
- ビルドされたイメージからコンテナを起動し、アプリケーションが正常に動作すること。
