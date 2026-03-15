"""Fix DailySummary unique constraint for soft deletes

Revision ID: ecd98c6cecdb
Revises: m1n2o3p4
Create Date: 2026-03-15 15:02:08.373396+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ecd98c6cecdb'
down_revision: Union[str, Sequence[str], None] = 'm1n2o3p4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 既存の全行一意制約を削除し、論理削除を考慮した部分インデックスに置き換える
    op.drop_constraint('uix_daily_summary_baby_date', 'daily_summaries', type_='unique')
    op.create_index(
        'uix_daily_summary_baby_date_partial',
        'daily_summaries',
        ['baby_id', 'summary_date'],
        unique=True,
        postgresql_where=sa.text('is_deleted = false'),
    )


def downgrade() -> None:
    op.drop_index(
        'uix_daily_summary_baby_date_partial',
        table_name='daily_summaries',
        postgresql_where=sa.text('is_deleted = false'),
    )
    op.create_unique_constraint(
        'uix_daily_summary_baby_date',
        'daily_summaries',
        ['baby_id', 'summary_date'],
    )
