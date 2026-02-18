# Technical Insights & Engineering Notes

このドキュメントは、開発プロセスにおける技術的な工夫、パフォーマンス最適化、および設計上の決定事項（ADRに近いもの）を記録する場所です。
開発者（人間）やAIアシスタントが、過去の決定背景を理解するために使用します。

## Render Pipeline Optimization

Renderでのビルド時間短縮とPipeline Minutes（無料枠/クレジット）節約のため、パッケージマネージャーに工夫を施しています。

### Backend: `uv` の活用

Python環境の依存関係解決において、標準の `pip` は低速になることがあります。特に依存関係が多い場合、解決に時間がかかります。
そこで、Rust製の高速なパッケージインストーラーである [uv](https://github.com/astral-sh/uv) を導入しました。

- **設定箇所**: `render.yaml` > `buildCommand`
- **実装**:
  ```yaml
  buildCommand: pip install uv && uv pip install -r requirements.txt && ...
  ```
- **効果**:
  - 依存関係の解決とインストール時間が大幅に短縮（数分→数十秒レベルになることも）。
  - Renderのビルド時間短縮によるコスト削減。

### Frontend: `pnpm` の活用

Node.js環境では、標準の `npm` の代わりに [pnpm](https://pnpm.io/) を採用しています。

- **理由**:
  - **高速性**: npm/yarnと比較してインストールが高速。
  - **ディスク効率**: ハードリンクを使用するため、ディスク使用量を抑えられる（Renderのビルド環境にはあまり影響しないが、ローカル開発では有利）。
  - **Strictness**: 平坦な `node_modules` を作らないため、幽霊依存（Phantom dependencies）を防げる。
- **設定箇所**: `render.yaml` > `buildCommand`
- **実装**:
  RenderのNode環境で `corepack` を有効化して使用しています。
  ```bash
  cd frontend
  corepack enable pnpm
  pnpm install --frozen-lockfile
  pnpm build
  ```

### Development Dependencies Separation

本番環境のビルドサイズとインストール時間を最小化するため、Pythonパッケージの依存関係を明確に分離しています。

- **`requirements.txt`**: 本番動作に必要なパッケージのみ（FastAPI, SQLAlchemy等）
- **`requirements-dev.txt`**: 開発・テスト時にのみ必要なパッケージ（pytest, httpx等）
  - `requirements.txt` を継承（`-r requirements.txt`）しています。

- **効果**:
  Renderへのデプロイ時（`requirements.txt`のみインストール）に、テストライブラリ等の不要なパッケージダウンロード・インストールを回避し、ビルド時間を短縮しています。

