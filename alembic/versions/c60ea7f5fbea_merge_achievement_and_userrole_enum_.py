"""merge_achievement_and_userrole_enum_heads

Revision ID: c60ea7f5fbea
Revises: 2a80d4519792, i1j2k3l4
Create Date: 2026-03-11 08:24:28.143786+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c60ea7f5fbea'
down_revision: Union[str, Sequence[str], None] = ('2a80d4519792', 'i1j2k3l4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
