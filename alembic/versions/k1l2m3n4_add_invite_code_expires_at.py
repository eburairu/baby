"""add_invite_code_expires_at

Revision ID: k1l2m3n4
Revises: 0c6faa11a8a9
Create Date: 2026-03-11

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'k1l2m3n4'
down_revision: Union[str, Sequence[str], None] = '0c6faa11a8a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('families', sa.Column('invite_code_expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('families', 'invite_code_expires_at')
