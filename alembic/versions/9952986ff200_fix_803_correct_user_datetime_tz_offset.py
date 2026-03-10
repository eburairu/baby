"""fix_803_correct_user_datetime_tz_offset

#803 のマイグレーションでユーザー入力の時刻カラムが TIMESTAMPTZ に変換された際、
JST naive な値が UTC として解釈されてしまい 9 時間ずれが生じた。
ユーザー入力フィールドのみ 9 時間引いて正しい UTC 値に補正する。

対象: ユーザーが入力した時刻カラム（feeding_time, change_time 等）
除外: サーバー生成の created_at, updated_at, expires_at 等

Revision ID: 9952986ff200
Revises: e7d5ce607567
Create Date: 2026-03-10 18:57:15.609113+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9952986ff200'
down_revision: Union[str, Sequence[str], None] = 'e7d5ce607567'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# ユーザー入力の時刻カラム一覧（サーバー生成の created_at 等は含まない）
_USER_DATETIME_COLUMNS = [
    ("feedings", "feeding_time", False),
    ("diapers", "change_time", False),
    ("sleeps", "start_time", False),
    ("sleeps", "end_time", True),           # nullable
    ("temperature_records", "measured_at", False),
    ("notes", "note_time", False),
    ("schedules", "scheduled_time", False),
    ("contractions", "start_time", False),
    ("contractions", "end_time", True),      # nullable
    ("contraction_timer_states", "start_time", True),  # nullable
]


def upgrade() -> None:
    """JST naive → UTC として誤解釈された 9 時間分を引いて補正する。"""
    for table, column, nullable in _USER_DATETIME_COLUMNS:
        if nullable:
            op.execute(
                f"UPDATE {table} SET {column} = {column} - INTERVAL '9 hours'"
                f" WHERE {column} IS NOT NULL"
            )
        else:
            op.execute(
                f"UPDATE {table} SET {column} = {column} - INTERVAL '9 hours'"
            )


def downgrade() -> None:
    """補正を元に戻す（9 時間足す）。"""
    for table, column, nullable in _USER_DATETIME_COLUMNS:
        if nullable:
            op.execute(
                f"UPDATE {table} SET {column} = {column} + INTERVAL '9 hours'"
                f" WHERE {column} IS NOT NULL"
            )
        else:
            op.execute(
                f"UPDATE {table} SET {column} = {column} + INTERVAL '9 hours'"
            )
