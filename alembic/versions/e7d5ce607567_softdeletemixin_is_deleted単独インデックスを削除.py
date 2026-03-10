"""SoftDeleteMixin is_deleted単独インデックスを削除

SoftDeleteMixinの is_deleted=mapped_column(index=True) が生成していた
不要な単独インデックスを削除する。各テーブルには複合インデックスが
すでに定義されているため、単独インデックスは冗長。

Revision ID: e7d5ce607567
Revises: 288d335020a7
Create Date: 2026-03-10 14:36:24.293013+09:00

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'e7d5ce607567'
down_revision: Union[str, Sequence[str], None] = '288d335020a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# SoftDeleteMixinを継承する全テーブルの単独 is_deleted インデックス
_SINGLE_INDEXES = [
    ("feedings",            "ix_feedings_is_deleted"),
    ("diapers",             "ix_diapers_is_deleted"),
    ("sleeps",              "ix_sleeps_is_deleted"),
    ("growths",             "ix_growths_is_deleted"),
    ("notes",               "ix_notes_is_deleted"),
    ("babies",              "ix_babies_is_deleted"),
    ("families",            "ix_families_is_deleted"),
    ("contractions",        "ix_contractions_is_deleted"),
    ("daily_summaries",     "ix_daily_summaries_is_deleted"),
    ("schedules",           "ix_schedules_is_deleted"),
    ("vaccinations",        "ix_vaccinations_is_deleted"),
    ("temperature_records", "ix_temperature_records_is_deleted"),
    ("record_comments",     "ix_record_comments_is_deleted"),
    ("milestones",          "ix_milestones_is_deleted"),
    ("app_notifications",   "ix_app_notifications_is_deleted"),
    ("push_subscriptions",  "ix_push_subscriptions_is_deleted"),
]


def upgrade() -> None:
    """不要な is_deleted 単独インデックスを削除する。"""
    for table_name, index_name in _SINGLE_INDEXES:
        op.drop_index(index_name, table_name=table_name, if_exists=True)


def downgrade() -> None:
    """is_deleted 単独インデックスを再作成する（ロールバック用）。"""
    for table_name, index_name in reversed(_SINGLE_INDEXES):
        op.create_index(index_name, table_name, ["is_deleted"])
