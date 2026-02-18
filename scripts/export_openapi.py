#!/usr/bin/env python3
"""FastAPI の OpenAPI スキーマを frontend/openapi.json に出力するスクリプト。

使用方法:
    python scripts/export_openapi.py

プロジェクトルートから実行すること。サーバー起動は不要。
"""
import json
import os
import sys
from pathlib import Path

# DATABASE_URL が未設定の場合（CI 等）はダミー値をセット。
# create_engine() は URL を解析するだけで実際には接続しないため安全。
if not os.environ.get("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "postgresql://dummy:dummy@localhost/dummy"

# プロジェクトルートを sys.path に追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.main import app  # noqa: E402

output_path = project_root / "frontend" / "openapi.json"

schema = app.openapi()

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(schema, f, ensure_ascii=False, indent=2, sort_keys=True)
    f.write("\n")

print(f"OpenAPI schema exported to {output_path}")
