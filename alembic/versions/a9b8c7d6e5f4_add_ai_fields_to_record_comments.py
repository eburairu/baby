"""record_commentsにAI関連フィールドを追加し、user_idをNullable化

Revision ID: a9b8c7d6e5f4
Revises: 3bc9c82be9d6
Create Date: 2026-02-21 02:00:00.000000+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = 'a9b8c7d6e5f4'
down_revision: Union[str, Sequence[str], None] = '3bc9c82be9d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(conn, table_name: str) -> bool:
    result = conn.execute(
        sa.text(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
            "WHERE table_schema='public' AND table_name=:t)"
        ),
        {"t": table_name},
    )
    return result.scalar()


def _column_exists(conn, table_name: str, column_name: str) -> bool:
    result = conn.execute(
        sa.text(
            "SELECT EXISTS (SELECT 1 FROM information_schema.columns "
            "WHERE table_schema='public' AND table_name=:t AND column_name=:c)"
        ),
        {"t": table_name, "c": column_name},
    )
    return result.scalar()


def upgrade() -> None:
    conn = op.get_bind()

    if not _table_exists(conn, "record_comments"):
        # テーブルが存在しない場合: AI列込みで新規作成
        op.create_table(
            "record_comments",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("baby_id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=True),
            sa.Column("record_type", sa.String(), nullable=False),
            sa.Column("record_id", sa.Integer(), nullable=False),
            sa.Column("content", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
            sa.Column("is_ai_generated", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            sa.Column("ai_has_concern", sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(
                ["baby_id"], ["babies.id"],
                name="fk_record_comments_baby_id_babies",
                ondelete="CASCADE",
            ),
            sa.ForeignKeyConstraint(
                ["user_id"], ["users.id"],
                name="fk_record_comments_user_id_users",
                ondelete="SET NULL",
            ),
            sa.PrimaryKeyConstraint("id", name="pk_record_comments"),
        )
        op.create_index("idx_comment_record", "record_comments", ["record_type", "record_id"], unique=False)
        op.create_index("ix_record_comments_id", "record_comments", ["id"], unique=False)
    else:
        # テーブルが既存の場合: user_id を nullable 化し AI 列を追加

        # user_id nullable 化（外部キー制約名は環境依存のため conditional に処理）
        op.execute(sa.text(
            "ALTER TABLE record_comments "
            "ALTER COLUMN user_id DROP NOT NULL"
        ))

        # 外部キー制約を SET NULL に更新（既存制約を削除して再作成）
        try:
            op.drop_constraint("fk_record_comments_user_id_users", "record_comments", type_="foreignkey")
        except Exception:
            pass  # 制約名が異なる場合は無視
        op.create_foreign_key(
            "fk_record_comments_user_id_users",
            "record_comments", "users",
            ["user_id"], ["id"],
            ondelete="SET NULL",
        )

        if not _column_exists(conn, "record_comments", "is_ai_generated"):
            op.add_column(
                "record_comments",
                sa.Column("is_ai_generated", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            )

        if not _column_exists(conn, "record_comments", "ai_has_concern"):
            op.add_column(
                "record_comments",
                sa.Column("ai_has_concern", sa.Boolean(), nullable=True),
            )


def downgrade() -> None:
    conn = op.get_bind()
    if _column_exists(conn, "record_comments", "ai_has_concern"):
        op.drop_column("record_comments", "ai_has_concern")
    if _column_exists(conn, "record_comments", "is_ai_generated"):
        op.drop_column("record_comments", "is_ai_generated")
