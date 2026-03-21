"""Add poop detail columns to diapers table

Revision ID: n1o2p3q4
Revises: m1n2o3p4
Create Date: 2026-03-22 06:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'n1o2p3q4'
down_revision = '7d1f65e674b7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('diapers', sa.Column('poop_color', sa.String(), nullable=True))
    op.add_column('diapers', sa.Column('poop_consistency', sa.String(), nullable=True))
    op.add_column('diapers', sa.Column('poop_amount', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('diapers', 'poop_amount')
    op.drop_column('diapers', 'poop_consistency')
    op.drop_column('diapers', 'poop_color')
