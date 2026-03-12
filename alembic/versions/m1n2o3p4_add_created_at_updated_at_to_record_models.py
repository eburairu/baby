"""Add created_at and updated_at to record models

Revision ID: m1n2o3p4
Revises: l1m2n3o4
Create Date: 2026-03-12 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'm1n2o3p4'
down_revision = 'l1m2n3o4'
branch_labels = None
depends_on = None

# 対象テーブル（両方のカラムを追加）
TABLES_BOTH = [
    'feedings',
    'sleeps',
    'diapers',
    'growths',
    'contractions',
    'vaccinations',
    'milestones',
    'temperature_records',
]

# updated_at のみ追加（created_at は既存）
TABLES_UPDATED_AT_ONLY = [
    'schedules',
]


def upgrade() -> None:
    for table in TABLES_BOTH:
        op.add_column(
            table,
            sa.Column(
                'created_at',
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )
        op.add_column(
            table,
            sa.Column(
                'updated_at',
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )

    for table in TABLES_UPDATED_AT_ONLY:
        op.add_column(
            table,
            sa.Column(
                'updated_at',
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )


def downgrade() -> None:
    for table in TABLES_UPDATED_AT_ONLY:
        op.drop_column(table, 'updated_at')

    for table in TABLES_BOTH:
        op.drop_column(table, 'updated_at')
        op.drop_column(table, 'created_at')
