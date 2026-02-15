"""add_gender_to_babies

Revision ID: b9faf88bdd36
Revises: 52a1af06021f
Create Date: 2026-02-15 09:41:29.488504+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b9faf88bdd36'
down_revision: Union[str, Sequence[str], None] = '52a1af06021f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('babies', sa.Column('gender', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('babies', 'gender')
