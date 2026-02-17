"""create push notifications tables

Revision ID: c3cd1606df26
Revises: c37592925139
Create Date: 2026-02-17 16:05:08.161786+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3cd1606df26'
down_revision: Union[str, Sequence[str], None] = 'c37592925139'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # push_subscriptions table
    op.create_table(
        'push_subscriptions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('endpoint', sa.String(), nullable=False),
        sa.Column('p256dh', sa.String(), nullable=False),
        sa.Column('auth', sa.String(), nullable=False),
        sa.Column('user_agent', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )

    # notification_settings table
    op.create_table(
        'notification_settings',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True, nullable=False),
        sa.Column('family_record_enabled', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('feeding_reminder_enabled', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('diaper_reminder_enabled', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('daily_summary_enabled', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('system_notice_enabled', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('dnd_start_time', sa.Time(), nullable=True),
        sa.Column('dnd_end_time', sa.Time(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now())
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('notification_settings')
    op.drop_index(op.f('ix_push_subscriptions_id'), table_name='push_subscriptions')
    op.drop_table('push_subscriptions')
