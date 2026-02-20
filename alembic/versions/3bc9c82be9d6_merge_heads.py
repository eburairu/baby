"""merge heads

Revision ID: 3bc9c82be9d6
Revises: 0332ddd5a74c, e6d3c1a8f902
Create Date: 2026-02-20 14:45:18.001606+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3bc9c82be9d6'
down_revision: Union[str, Sequence[str], None] = ('0332ddd5a74c', 'e6d3c1a8f902')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
