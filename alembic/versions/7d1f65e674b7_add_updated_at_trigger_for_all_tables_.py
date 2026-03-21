"""add updated_at trigger for all tables with updated_at

Revision ID: 7d1f65e674b7
Revises: m1n2o3p4
Create Date: 2026-03-21 10:52:43.918601

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7d1f65e674b7'
down_revision = '36c405750b42'
branch_labels = None
depends_on = None

TABLES = [
    'system_settings',
    'notification_settings',
    'contractions',
    'daily_summaries',
    'diapers',
    'feedings',
    'growths',
    'milestones',
    'notes',
    'schedules',
    'sleeps',
    'temperature_records',
    'vaccinations'
]

def upgrade() -> None:
    # 1. トリガー関数の作成
    op.execute("""
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = clock_timestamp();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)

    # 2. 各テーブルにトリガーを適用
    for table in TABLES:
        op.execute(f"""
            CREATE TRIGGER update_{table}_updated_at
                BEFORE UPDATE ON {table}
                FOR EACH ROW
                EXECUTE FUNCTION set_updated_at();
        """)


def downgrade() -> None:
    # 1. トリガーの削除
    for table in TABLES:
        op.execute(f"DROP TRIGGER IF EXISTS update_{table}_updated_at ON {table}")

    # 2. トリガー関数の削除
    op.execute("DROP FUNCTION IF EXISTS set_updated_at()")
