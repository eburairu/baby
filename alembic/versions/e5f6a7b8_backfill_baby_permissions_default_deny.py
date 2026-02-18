"""backfill baby_permissions for existing users (default deny migration)

既存の MEMBER/VIEWER ユーザーに全 Baby × 全 record_type の can_view=true レコードを付与する。
これにより、デフォルト拒否への変更後も既存ユーザーの閲覧体験が維持される。
新規参加ユーザーはレコードが存在しないため、引き続きデフォルト拒否となる。

Revision ID: e5f6a7b8c9d0
Revises: b2c3d4e5f6a7
Create Date: 2026-02-18 12:00:00.000000+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

RECORD_TYPES = ['baby', 'feeding', 'sleep', 'diaper', 'growth', 'contraction', 'schedule', 'note']


def upgrade() -> None:
    # 既存の MEMBER/VIEWER ユーザー × 全 Baby × 全 record_type に can_view=true を挿入
    # ON CONFLICT DO NOTHING で既存レコードは上書きしない
    conn = op.get_bind()
    for record_type in RECORD_TYPES:
        conn.execute(sa.text("""
            INSERT INTO baby_permissions (baby_id, user_id, record_type, can_view)
            SELECT b.id, fu.user_id, :record_type, true
            FROM babies b
            JOIN family_users fu ON fu.family_id = b.family_id AND fu.role != 'admin'
            ON CONFLICT (baby_id, user_id, record_type) DO NOTHING
        """), {"record_type": record_type})


def downgrade() -> None:
    # バックフィルしたレコードを削除する
    # （既存のカスタム設定も削除してしまうため、本番での downgrade は慎重に）
    conn = op.get_bind()
    conn.execute(sa.text("""
        DELETE FROM baby_permissions
        WHERE can_view = true
        AND (baby_id, user_id, record_type) IN (
            SELECT b.id, fu.user_id, r.record_type
            FROM babies b
            JOIN family_users fu ON fu.family_id = b.family_id AND fu.role != 'admin'
            CROSS JOIN (
                SELECT unnest(ARRAY['baby','feeding','sleep','diaper','growth','contraction','schedule','note']) AS record_type
            ) r
        )
    """))
