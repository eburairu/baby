"""Add ip_address and user_agent to user_sessions

Revision ID: l1m2n3o4
Revises: k1l2m3n4
Create Date: 2026-03-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'l1m2n3o4'
down_revision = 'k1l2m3n4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('user_sessions', sa.Column('ip_address', sa.String(), nullable=True))
    op.add_column('user_sessions', sa.Column('user_agent', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('user_sessions', 'user_agent')
    op.drop_column('user_sessions', 'ip_address')
