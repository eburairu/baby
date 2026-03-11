"""merge_clean_diapertype_head

Revision ID: 0c6faa11a8a9
Revises: c60ea7f5fbea, j1k2l3m4
Create Date: 2026-03-11 10:11:22.688078+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0c6faa11a8a9'
down_revision: Union[str, Sequence[str], None] = ('c60ea7f5fbea', 'j1k2l3m4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
