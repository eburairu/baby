"""add instagram_username to babies

Revision ID: p1q2r3s4
Revises: o1p2q3r4
Create Date: 2026-04-05

"""
from alembic import op
import sqlalchemy as sa

revision = 'p1q2r3s4'
down_revision = 'o1p2q3r4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('babies', sa.Column('instagram_username', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('babies', 'instagram_username')
