"""add_soft_delete_to_major_models

Revision ID: 578a0089228f
Revises: h1i2j3k4
Create Date: 2026-03-09 19:47:39.483044+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '578a0089228f'
down_revision: Union[str, Sequence[str], None] = 'h1i2j3k4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema safety."""
    tables = [
        'families', 'babies', 'feedings', 'sleeps', 'diapers', 'growths', 
        'notes', 'contractions', 'schedules', 'milestones', 'vaccinations', 
        'temperature_records', 'record_comments', 'daily_summaries', 
        'app_notifications', 'push_subscriptions'
    ]
    
    for table in tables:
        # add_column
        op.add_column(table, sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')))
        # create index for is_deleted
        op.create_index(f'ix_{table}_is_deleted', table, ['is_deleted'], unique=False)

    # 複合インデックスの追加
    op.create_index('ix_families_id_is_deleted', 'families', ['id', 'is_deleted'], unique=False)
    op.create_index('ix_babies_baby_id_is_deleted', 'babies', ['id', 'is_deleted'], unique=False)
    op.create_index('ix_feedings_baby_id_is_deleted', 'feedings', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_sleeps_baby_id_is_deleted', 'sleeps', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_diapers_baby_id_is_deleted', 'diapers', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_growths_baby_id_is_deleted', 'growths', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_notes_baby_id_is_deleted', 'notes', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_contractions_baby_id_is_deleted', 'contractions', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_schedules_baby_id_is_deleted', 'schedules', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_milestones_baby_id_is_deleted', 'milestones', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_vaccinations_baby_id_is_deleted', 'vaccinations', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_temperature_records_baby_id_is_deleted', 'temperature_records', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_record_comments_baby_id_is_deleted', 'record_comments', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_daily_summaries_baby_id_is_deleted', 'daily_summaries', ['baby_id', 'is_deleted'], unique=False)
    op.create_index('ix_app_notifications_user_id_is_deleted', 'app_notifications', ['user_id', 'is_deleted'], unique=False)
    op.create_index('ix_push_subscriptions_user_id_is_deleted', 'push_subscriptions', ['user_id', 'is_deleted'], unique=False)


def downgrade() -> None:
    """Downgrade schema safety."""
    tables = [
        'families', 'babies', 'feedings', 'sleeps', 'diapers', 'growths', 
        'notes', 'contractions', 'schedules', 'milestones', 'vaccinations', 
        'temperature_records', 'record_comments', 'daily_summaries', 
        'app_notifications', 'push_subscriptions'
    ]
    
    for table in tables:
        op.drop_index(f'ix_{table}_is_deleted', table_name=table)
        
    op.drop_index('ix_push_subscriptions_user_id_is_deleted', table_name='push_subscriptions')
    op.drop_index('ix_app_notifications_user_id_is_deleted', table_name='app_notifications')
    op.drop_index('ix_daily_summaries_baby_id_is_deleted', table_name='daily_summaries')
    op.drop_index('ix_record_comments_baby_id_is_deleted', table_name='record_comments')
    op.drop_index('ix_temperature_records_baby_id_is_deleted', table_name='temperature_records')
    op.drop_index('ix_vaccinations_baby_id_is_deleted', table_name='vaccinations')
    op.drop_index('ix_milestones_baby_id_is_deleted', table_name='milestones')
    op.drop_index('ix_schedules_baby_id_is_deleted', table_name='schedules')
    op.drop_index('ix_contractions_baby_id_is_deleted', table_name='contractions')
    op.drop_index('ix_notes_baby_id_is_deleted', table_name='notes')
    op.drop_index('ix_growths_baby_id_is_deleted', table_name='growths')
    op.drop_index('ix_diapers_baby_id_is_deleted', table_name='diapers')
    op.drop_index('ix_sleeps_baby_id_is_deleted', table_name='sleeps')
    op.drop_index('ix_feedings_baby_id_is_deleted', table_name='feedings')
    op.drop_index('ix_babies_baby_id_is_deleted', table_name='babies')
    op.drop_index('ix_families_id_is_deleted', table_name='families')

    for table in tables:
        op.drop_column(table, 'is_deleted')
