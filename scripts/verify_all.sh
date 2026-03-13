#!/bin/bash
set -e

# カラー出力設定
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== 検証プロセスを開始します ===${NC}"

# 0. コミット禁止ファイルのチェック（追加）
echo -e "${YELLOW}--- [0/7] ステージング済みファイルの最終チェック... ---${NC}"
sh scripts/check_staged_files.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 誤ったファイルがステージングされています。修正してください。${NC}"
    exit 1
fi

# 1. 仮想環境の確認とアクティベート
if [ -d ".venv" ]; then
    echo -e "${GREEN}✓ 仮想環境 (.venv) を検出しました${NC}"
    source .venv/bin/activate
else
    echo -e "${RED}✗ 仮想環境が見つかりません。'uv venv .venv' 等で作成してください。${NC}"
    exit 1
fi

# 環境変数の読み込み
set -a
[ -f .env ] && source .env
set +a

# 1.5 Alembic マイグレーションチェック
echo -e "
${YELLOW}--- [1/7] Alembic スキーマドリフトと複数Headの検知... ---${NC}"
HEADS_COUNT=$(alembic heads | grep "(head)" | wc -l)
if [ "$HEADS_COUNT" -gt 1 ]; then
    echo -e "${RED}✗ 複数の Alembic head が検出されました。 'alembic merge heads' を実行して解消してください。${NC}"
    exit 1
fi

alembic upgrade head
alembic check
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Alembic スキーマにドリフト（差分）が検出されました。マイグレーションファイルを作成するか、最新のDBにアップグレードしてください。${NC}"
    exit 1
fi

# 2. バックエンドテスト
echo -e "
${YELLOW}--- [2/7] バックエンドテスト実行中... ---${NC}"
# 仮想環境の python を使用
.venv/bin/python -m pytest tests/

# 3. OpenAPI スキーマの更新
echo -e "
${YELLOW}--- [3/7] OpenAPI スキーマの更新と検証... ---${NC}"
.venv/bin/python scripts/export_openapi.py

# 4. フロントエンド型定義の生成
echo -e "
${YELLOW}--- [4/7] フロントエンド型定義の生成... ---${NC}"
cd frontend
pnpm types:generate

# 5. フロントエンド Lint
echo -e "
${YELLOW}--- [5/7] フロントエンド Lint 実行中... ---${NC}"
pnpm lint

# 6. フロントエンド Build
echo -e "
${YELLOW}--- [6/7] フロントエンド Build 実行中... ---${NC}"
pnpm build

echo -e "
${GREEN}✨ 全ての検証が完了しました！ ✨${NC}"
cd ..
