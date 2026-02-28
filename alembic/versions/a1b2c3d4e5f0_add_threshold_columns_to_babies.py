"""add threshold columns to babies

Revision ID: a1b2c3d4e5f0
Revises: f2e3d4c5
Create Date: 2026-02-28 14:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f0'
down_revision: Union[str, Sequence[str], None] = 'f2e3d4c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('babies', sa.Column('feeding_threshold_minutes', sa.Integer(), nullable=True))
    op.add_column('babies', sa.Column('diaper_threshold_minutes', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('babies', 'diaper_threshold_minutes')
    op.drop_column('babies', 'feeding_threshold_minutes')
