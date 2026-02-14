# AGENTS.md - 開発ガイドライン

このプロジェクト（Baby-App）で作業する AI エージェント（Claude, Gemini 等）向けのガイドラインです。

## プロジェクト概要

Baby-App は、家族単位で赤ちゃんの育児記録（授乳、睡眠、おむつ、成長、陣痛、スケジュール）を共同管理するための Web アプリケーションです。
招待制を採用し、セキュアな家族共有環境を提供します。

## 技術スタック

詳細な設計は `.specify/specs/system_design.md` を参照してください。

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS v4, Zustand, SWR
- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic v2
- **Database**: PostgreSQL (Neon), Alembic (Migration)
- **Deployment**: Docker (Single Service Deployment), Render

## ディレクトリ構造

```
baby-app/
├── app/                   # Backend (FastAPI)
│   ├── models/            # SQLAlchemy モデル
│   ├── schemas/           # Pydantic スキーマ
│   ├── routers/           # API ルート (/api/*)
│   └── services/          # ビジネスロジック
├── frontend/              # Frontend (Next.js)
│   ├── app/               # App Router
│   ├── components/        # UI コンポーネント
│   └── stores/            # Zustand ストア
├── alembic/               # DB マイグレーション
├── .specify/specs/        # 仕様書 (SDD の起点)
└── AGENTS.md              # 本ファイル
```

## 開発環境のセットアップ

### Backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
```

### Frontend
```bash
cd frontend
npm install
```

## よく使うコマンド

| コマンド | 説明 |
|---|---|
| `uvicorn app.main:app --reload` | Backend 起動 |
| `cd frontend && npm run dev` | Frontend 起動 |
| `npm test` | 全テスト実行（バックエンド + フロントエンド） |
| `npm run test:backend` | バックエンドのみテスト実行（pytest） |
| `npm run test:frontend` | フロントエンドのみテスト実行（vitest） |
| `alembic revision --autogenerate -m "description"` | マイグレーション作成 |
| `alembic upgrade head` | マイグレーション適用 |
| `cd frontend && npm run build` | ビルド確認 |
| `cd frontend && npm run lint` | Lint 実行 |

## コーディング規約

1. **仕様駆動開発 (SDD)**:
   - コードを変更する前に、必ず `.specify/specs/` 配下の仕様書を確認・更新してください。

2. **Python (Backend)**:
   - 型ヒントを必須とし、PEP 8 に準拠。

3. **TypeScript (Frontend)**:
   - `strict` モード。関数コンポーネントと Hooks を使用。

4. **API 設計**:
   - すべてのエンドポイントは `/api` プレフィックスを持ちます。
   - 認証は Cookie ベースのセッション管理です。

5. **CSS/UI**:
   - Tailwind CSS v4 を使用。

6. **コミットメッセージ**:
   - Conventional Commits 形式（`feat:`, `fix:`, `chore:`, `docs:` 等）を使用。

## 注意事項

- **検証の徹底**: 変更後は必ずビルド (`npm run build`) を実行し、型チェック・動作確認を完了させてから報告してください。
- **セキュリティ**: API キーや秘密情報をコードに含めないでください。
- **シングルサービス構成**: FastAPI がフロントエンドの静的ファイルも配信する構成であることを意識してください。
- **DB**: ローカル・本番ともに PostgreSQL (Neon) を使用します。ローカルは Neon の `develop` ブランチ、本番は `production` ブランチに接続します。Docker は不要です。
