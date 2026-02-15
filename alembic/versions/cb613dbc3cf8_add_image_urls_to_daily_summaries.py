"""add_image_urls_to_daily_summaries

Revision ID: cb613dbc3cf8
Revises: 35cf117c9ca2
Create Date: 2026-02-15 17:01:04.699156+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cb613dbc3cf8'
down_revision: Union[str, Sequence[str], None] = 'b9faf88bdd36'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'daily_summaries',
        sa.Column('image_urls', sa.JSON(), nullable=True, server_default='[]'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('daily_summaries', 'image_urls')
