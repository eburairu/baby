"""merge_performance_indexes_and_contraction_index

Revision ID: 86c007e59a68
Revises: 7556b37b9e78, f1e2d3c4b5a6
Create Date: 2026-02-14 09:16:38.873630+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '86c007e59a68'
down_revision: Union[str, Sequence[str], None] = ('7556b37b9e78', 'f1e2d3c4b5a6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
