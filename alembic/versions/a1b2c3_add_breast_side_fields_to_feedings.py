"""add breast side fields to feedings (Phase 1)

Revision ID: a1b2c3d4e5f7
Revises: c3cd1606df26
Create Date: 2026-02-18 00:00:00.000000+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f7'
down_revision: Union[str, Sequence[str], None] = 'c3cd1606df26'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create BreastSide enum
    breast_side_enum = sa.Enum('LEFT', 'RIGHT', 'BOTH', name='breastside')
    breast_side_enum.create(op.get_bind(), checkfirst=True)

    # Add new columns to feedings table
    op.add_column('feedings', sa.Column('left_breast_minutes', sa.Integer(), nullable=True))
    op.add_column('feedings', sa.Column('right_breast_minutes', sa.Integer(), nullable=True))
    op.add_column('feedings', sa.Column('last_breast_side', sa.Enum('LEFT', 'RIGHT', 'BOTH', name='breastside'), nullable=True))


def downgrade() -> None:
    op.drop_column('feedings', 'last_breast_side')
    op.drop_column('feedings', 'right_breast_minutes')
    op.drop_column('feedings', 'left_breast_minutes')

    # Drop enum type
    sa.Enum(name='breastside').drop(op.get_bind(), checkfirst=True)
