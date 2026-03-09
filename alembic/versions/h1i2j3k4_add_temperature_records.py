"""add_temperature_records

Revision ID: h1i2j3k4
Revises: g1h2i3j4
Create Date: 2026-03-09

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'h1i2j3k4'
down_revision: Union[str, Sequence[str], None] = 'g1h2i3j4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE temperaturemethod AS ENUM ('AXILLARY', 'EAR', 'FOREHEAD', 'RECTAL');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$
    """)
    op.execute("""
        CREATE TABLE temperature_records (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            baby_id INTEGER NOT NULL REFERENCES babies(id),
            measured_at TIMESTAMP NOT NULL,
            temperature FLOAT NOT NULL,
            method temperaturemethod NOT NULL DEFAULT 'AXILLARY',
            notes TEXT
        )
    """)
    op.execute("CREATE INDEX ix_temperature_records_id ON temperature_records (id)")
    op.execute("CREATE INDEX ix_temperature_records_user_id ON temperature_records (user_id)")
    op.execute("CREATE INDEX ix_temperature_records_measured_at ON temperature_records (measured_at)")
    op.execute("CREATE INDEX idx_temperature_baby_time ON temperature_records (baby_id, measured_at)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS temperature_records")
    op.execute("DROP TYPE IF EXISTS temperaturemethod")
