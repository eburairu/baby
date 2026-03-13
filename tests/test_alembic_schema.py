import subprocess
import os
import pytest
from alembic.config import Config
from alembic.script import ScriptDirectory

def test_alembic_single_head():
    """
    Alembicの複数Head（分岐）が存在しないかをテストする。
    """
    config = Config("alembic.ini")
    script = ScriptDirectory.from_config(config)
    heads = script.get_revisions("heads")
    assert len(heads) <= 1, f"Multiple alembic heads detected: {[h.revision for h in heads]}. Please merge them."

def test_alembic_schema_drift():
    """
    Alembicのスキーマドリフトが存在しないかをテストする。
    alembic check をサブプロセスで実行して確認。
    """
    if "sqlite" in os.environ.get("DATABASE_URL", ""):
        pytest.skip("Alembic schema drift check is not supported on SQLite")

    # 先にupgrade headを行っておく（ドリフトチェックのため）
    subprocess.run(["alembic", "upgrade", "head"], check=True, capture_output=True)
    
    result = subprocess.run(["alembic", "check"], capture_output=True, text=True)
    assert result.returncode == 0, f"Schema drift detected:\n{result.stdout}\n{result.stderr}"
