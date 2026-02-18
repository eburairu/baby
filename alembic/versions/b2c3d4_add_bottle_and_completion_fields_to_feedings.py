"""add bottle content type and feeding completion fields to feedings (Phase 2)

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f7
Create Date: 2026-02-18 00:01:00.000000+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create BottleContentType enum
    bottle_content_type_enum = sa.Enum('FORMULA', 'EXPRESSED_MILK', 'MIXED', name='bottlecontenttype')
    bottle_content_type_enum.create(op.get_bind(), checkfirst=True)

    # Create FeedingCompletion enum
    feeding_completion_enum = sa.Enum('FULL', 'PARTIAL', name='feedingcompletion')
    feeding_completion_enum.create(op.get_bind(), checkfirst=True)

    # Add new columns to feedings table
    op.add_column('feedings', sa.Column(
        'bottle_content_type',
        sa.Enum('FORMULA', 'EXPRESSED_MILK', 'MIXED', name='bottlecontenttype'),
        nullable=True
    ))
    op.add_column('feedings', sa.Column(
        'feeding_completion',
        sa.Enum('FULL', 'PARTIAL', name='feedingcompletion'),
        nullable=True
    ))


def downgrade() -> None:
    op.drop_column('feedings', 'feeding_completion')
    op.drop_column('feedings', 'bottle_content_type')

    sa.Enum(name='feedingcompletion').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='bottlecontenttype').drop(op.get_bind(), checkfirst=True)
