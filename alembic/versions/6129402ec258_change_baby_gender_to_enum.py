"""change baby gender to enum

Revision ID: 6129402ec258
Revises: 578a0089228f
Create Date: 2026-03-10 00:00:56.643068+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '6129402ec258'
down_revision: Union[str, Sequence[str], None] = '578a0089228f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    gender_enum = postgresql.ENUM('boy', 'girl', 'unknown', name='gender', create_type=False)
    gender_enum.create(op.get_bind(), checkfirst=True)
    op.execute('ALTER TABLE babies ALTER COLUMN gender TYPE gender USING gender::gender')


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('babies', 'gender',
               existing_type=postgresql.ENUM('boy', 'girl', 'unknown', name='gender'),
               type_=sa.String(),
               existing_nullable=True)
    gender_enum = postgresql.ENUM('boy', 'girl', 'unknown', name='gender')
    gender_enum.drop(op.get_bind(), checkfirst=True)
