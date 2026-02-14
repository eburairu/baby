"""merge performance and contraction index branches

Revision ID: 5dc5a5d4af5c
Revises: 7556b37b9e78, f1e2d3c4b5a6
Create Date: 2026-02-14 15:48:30.601440+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5dc5a5d4af5c'
down_revision: Union[str, Sequence[str], None] = ('7556b37b9e78', 'f1e2d3c4b5a6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
