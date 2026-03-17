"""add unique index to milestones

Revision ID: 1a5763d7897a
Revises: ecd98c6cecdb
Create Date: 2026-03-17 22:40:54.484921+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1a5763d7897a'
down_revision: Union[str, Sequence[str], None] = 'ecd98c6cecdb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index(
        'uix_baby_milestone_type', 
        'milestones', 
        ['baby_id', 'milestone_type'], 
        unique=True, 
        postgresql_where="milestone_type != 'custom' AND is_deleted = false"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        'uix_baby_milestone_type', 
        table_name='milestones', 
        postgresql_where="milestone_type != 'custom' AND is_deleted = false"
    )
