"""Fix created_at/joined_at column defaults

Revision ID: a1b2c3d4e5f6
Revises: d91eb8885793
Create Date: 2026-02-13 05:30:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'd91eb8885793'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE families ALTER COLUMN created_at SET DEFAULT NOW()")
    op.execute("ALTER TABLE users ALTER COLUMN created_at SET DEFAULT NOW()")
    op.execute("ALTER TABLE user_sessions ALTER COLUMN created_at SET DEFAULT NOW()")
    op.execute("ALTER TABLE babies ALTER COLUMN created_at SET DEFAULT NOW()")
    op.execute("ALTER TABLE family_users ALTER COLUMN joined_at SET DEFAULT NOW()")
    op.execute("ALTER TABLE schedules ALTER COLUMN created_at SET DEFAULT NOW()")


def downgrade() -> None:
    op.execute("ALTER TABLE families ALTER COLUMN created_at DROP DEFAULT")
    op.execute("ALTER TABLE users ALTER COLUMN created_at DROP DEFAULT")
    op.execute("ALTER TABLE user_sessions ALTER COLUMN created_at DROP DEFAULT")
    op.execute("ALTER TABLE babies ALTER COLUMN created_at DROP DEFAULT")
    op.execute("ALTER TABLE family_users ALTER COLUMN joined_at DROP DEFAULT")
    op.execute("ALTER TABLE schedules ALTER COLUMN created_at DROP DEFAULT")
