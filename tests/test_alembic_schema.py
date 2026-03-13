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
