#!/bin/bash
# pre-commit hook: バックエンドファイルが変更されている場合に openapi.json を自動更新する
#
# 動作:
# 1. ステージ済みファイルに app/(models|schemas|routers)/ が含まれるか確認
# 2. 含まれる場合、export_openapi.py を実行してスキーマを再生成
# 3. 差分があれば git add して続行（コミットに自動で含める）

# プロジェクトルートを動的に取得
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
  echo "Error: git リポジトリのルートが見つかりません。"
  exit 1
fi

STAGED=$(git diff --cached --name-only 2>/dev/null)

if echo "$STAGED" | grep -qE "^app/(models|schemas|routers)/"; then
  echo "バックエンドファイルの変更を検出。openapi.json を自動更新します..."

  EXPORT_SCRIPT="$REPO_ROOT/scripts/export_openapi.py"
  if [ ! -f "$EXPORT_SCRIPT" ]; then
    echo "Error: $EXPORT_SCRIPT が見つかりません。"
    exit 1
  fi

  # uv が使えればそちらを優先、なければ python3 を使用
  if command -v uv >/dev/null 2>&1; then
    (cd "$REPO_ROOT" && uv run python "$EXPORT_SCRIPT")
  else
    (cd "$REPO_ROOT" && python3 "$EXPORT_SCRIPT")
  fi

  if [ $? -ne 0 ]; then
    echo "Error: openapi.json の生成に失敗しました。"
    exit 1
  fi

  OPENAPI_FILE="$REPO_ROOT/frontend/openapi.json"
  if ! git diff --quiet "$OPENAPI_FILE" 2>/dev/null || ! git diff --cached --quiet "$OPENAPI_FILE" 2>/dev/null; then
    git add "$OPENAPI_FILE"
    echo "frontend/openapi.json を更新してステージしました。"
  else
    echo "frontend/openapi.json は最新です。"
  fi
fi
