# ローカル環境動作確認仕様書

## 概要
本ドキュメントは、Baby-App のローカル開発環境におけるセットアップおよび動作確認の手順を規定する。

## 前提条件
- Python 3.10以上
- Node.js 20以上
- PostgreSQL が起動しており、`.env` で指定されたデータベースに接続可能であること

## セットアップ手順

### 1. 環境変数の設定
`.env.example` をコピーして `.env` を作成し、必要に応じて値を書き換える。
```bash
cp .env.example .env
```
※ ローカル開発時は `COOKIE_SECURE=false` に設定することを推奨。

### 2. バックエンドのセットアップ
仮想環境を作成し、依存ライブラリをインストールして、マイグレーションを実行する。
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
```

### 3. フロントエンドのセットアップ
```bash
cd frontend
npm install
```

## 動作確認手順

### 1. 全テストの実行（バックエンド & フロントエンド）
プロジェクト全体のテストを一つのコマンドで実行する。
```bash
npm test
```

### 2. バックエンド・ユニットテストの個別実行
```bash
npm run test:backend
```

### 3. フロントエンド・ユニットテストの個別実行
```bash
npm run test:frontend
```

### 4. フロントエンドのビルド
```bash
npm run build:frontend
```

### 4. 統合動作確認（Single Service 構成）
FastAPI がフロントエンドの静的ファイルを正常に配信し、API が動作することを確認する。

1. バックエンドサーバーの起動:
   ```bash
   uvicorn app.main:app --reload
   ```
2. ヘルスチェックの確認:
   - `http://localhost:8000/api/health` にアクセスし、`{"status": "ok"}` が返ることを確認。
3. APIドキュメントの確認:
   - `http://localhost:8000/docs` にアクセスし、Swagger UI が表示されることを確認。
4. フロントエンド画面の確認:
   - `http://localhost:8000/` にアクセスし、トップ画面が表示されることを確認。

## 異常時の対応
- データベース接続エラー: `DATABASE_URL` の設定を確認。
- マイグレーションエラー: `alembic upgrade head` が成功しているか確認。
- フロントエンドビルドエラー: `node_modules` を削除して再インストールを試行。
