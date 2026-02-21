"""increase llm_max_tokens default and add reasoning_effort

Revision ID: 929c1a492cec
Revises: e6cd95559f42
Create Date: 2026-02-21 17:55:24.630416+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '929c1a492cec'
down_revision = 'e6cd95559f42'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # llm_max_tokens を 800 から 2048 に引き上げ
    op.execute(
        "UPDATE system_settings SET value = '2048' WHERE key = 'llm_max_tokens'"
    )
    
    # llm_reasoning_effort を追加 (思考プロセスの制御用)
    # 既存のキーがあるか確認してから挿入
    op.execute(
        "INSERT INTO system_settings (key, value) "
        "SELECT 'llm_reasoning_effort', 'none' "
        "WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'llm_reasoning_effort')"
    )


def downgrade() -> None:
    # llm_max_tokens を 2048 から 800 に戻す
    op.execute(
        "UPDATE system_settings SET value = '800' WHERE key = 'llm_max_tokens'"
    )
    
    # llm_reasoning_effort を削除
    op.execute(
        "DELETE FROM system_settings WHERE key = 'llm_reasoning_effort'"
    )
