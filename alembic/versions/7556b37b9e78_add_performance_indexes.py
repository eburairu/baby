"""add performance indexes

Revision ID: 7556b37b9e78
Revises: 87137ab3b509
Create Date: 2026-02-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7556b37b9e78'
down_revision: Union[str, Sequence[str], None] = '87137ab3b509'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index('idx_growth_baby_date', 'growths', ['baby_id', 'date'], unique=False)
    op.create_index('idx_contraction_baby_start_time', 'contractions', ['baby_id', 'start_time'], unique=False)
    op.create_index('idx_schedule_baby_scheduled_time', 'schedules', ['baby_id', 'scheduled_time'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_schedule_baby_scheduled_time', table_name='schedules')
    op.drop_index('idx_contraction_baby_start_time', table_name='contractions')
    op.drop_index('idx_growth_baby_date', table_name='growths')
