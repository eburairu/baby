"""add_burped_to_feedings

Revision ID: f2e3d4c5
Revises: 9cf5c6299769
Create Date: 2026-02-27

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f2e3d4c5'
down_revision: Union[str, Sequence[str], None] = '9cf5c6299769'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('feedings', sa.Column('burped', sa.Boolean(), nullable=True))


def downgrade() -> None:
    op.drop_column('feedings', 'burped')
