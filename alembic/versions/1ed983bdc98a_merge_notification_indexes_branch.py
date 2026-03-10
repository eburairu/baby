"""merge notification indexes branch

Revision ID: 1ed983bdc98a
Revises: a9b8c7d6e5f4, d3f4g5h6i7j8
Create Date: 2026-02-21 10:37:34.782419+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1ed983bdc98a'
down_revision: Union[str, Sequence[str], None] = ('a9b8c7d6e5f4', 'd3f4g5h6i7j8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
