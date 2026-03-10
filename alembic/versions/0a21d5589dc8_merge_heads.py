"""merge heads

Revision ID: 0a21d5589dc8
Revises: 01a66095cc44, c3d95298c271
Create Date: 2026-02-27 12:55:30.996950+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0a21d5589dc8'
down_revision: Union[str, Sequence[str], None] = ('01a66095cc44', 'c3d95298c271')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
