"""add_userrole_enum_to_family_users

Revision ID: i1j2k3l4
Revises: h1i2j3k4
Create Date: 2026-03-11

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'i1j2k3l4'
down_revision: Union[str, Sequence[str], None] = 'h1i2j3k4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # userrole Enum 型を作成（既に存在する場合はスキップ）
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE userrole AS ENUM ('admin', 'member', 'viewer');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$
    """)
    # role カラムを String から userrole Enum 型に変更
    op.execute("""
        ALTER TABLE family_users
        ALTER COLUMN role TYPE userrole USING role::userrole
    """)


def downgrade() -> None:
    # role カラムを String に戻す
    op.execute("""
        ALTER TABLE family_users
        ALTER COLUMN role TYPE VARCHAR USING role::VARCHAR
    """)
    op.execute("DROP TYPE IF EXISTS userrole")
