"""Add index to RecordComment.baby_id

Revision ID: 7742386a8a71
Revises: 929c1a492cec
Create Date: 2026-02-22 07:19:55.460288+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7742386a8a71'
down_revision: Union[str, Sequence[str], None] = '929c1a492cec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index(op.f('ix_record_comments_baby_id'), 'record_comments', ['baby_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_record_comments_baby_id'), table_name='record_comments')
