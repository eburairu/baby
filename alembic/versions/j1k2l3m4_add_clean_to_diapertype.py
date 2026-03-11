"""add_clean_to_diapertype

Revision ID: j1k2l3m4
Revises: i1j2k3l4
Create Date: 2026-03-11

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'j1k2l3m4'
down_revision: Union[str, Sequence[str], None] = 'i1j2k3l4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # diapertype Enum に CLEAN を追加
    op.execute("ALTER TYPE diapertype ADD VALUE IF NOT EXISTS 'CLEAN'")


def downgrade() -> None:
    # PostgreSQL では Enum 値の削除が難しいため、downgrade は no-op
    pass
