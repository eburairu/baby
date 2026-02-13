"""Align with production schema

Revision ID: d91eb8885793
Revises:
Create Date: 2026-02-13 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'd91eb8885793'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ENUM types are created automatically by sa.Enum on first table use

    # families
    op.create_table(
        'families',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('invite_code', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_families_id', 'families', ['id'], unique=False)
    op.create_index('ix_families_invite_code', 'families', ['invite_code'], unique=True)

    # users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

    # family_users
    op.create_table(
        'family_users',
        sa.Column('family_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('joined_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False),
        sa.ForeignKeyConstraint(['family_id'], ['families.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('family_id', 'user_id'),
    )
    op.create_index('idx_family_users_family_user', 'family_users', ['family_id', 'user_id'], unique=False)

    # user_sessions
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('token', sa.String(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_user_sessions_id', 'user_sessions', ['id'], unique=False)
    op.create_index('ix_user_sessions_token', 'user_sessions', ['token'], unique=True)

    # babies
    op.create_table(
        'babies',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('family_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('birthday', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['family_id'], ['families.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_babies_id', 'babies', ['id'], unique=False)

    # baby_permissions
    op.create_table(
        'baby_permissions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('record_type', sa.String(), nullable=False),
        sa.Column('can_view', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('baby_id', 'user_id', 'record_type', name='uix_baby_user_record_type'),
    )
    op.create_index('ix_baby_permissions_id', 'baby_permissions', ['id'], unique=False)
    op.create_index('idx_baby_permissions_user_baby_type', 'baby_permissions', ['user_id', 'baby_id', 'record_type'], unique=False)

    # feedings
    op.create_table(
        'feedings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('feeding_time', sa.DateTime(), nullable=False),
        sa.Column('feeding_type', sa.Enum('BREAST', 'BOTTLE', 'MIXED', name='feedingtype'), nullable=False),
        sa.Column('amount_ml', sa.Float(), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_feedings_id', 'feedings', ['id'], unique=False)
    op.create_index('ix_feedings_feeding_time', 'feedings', ['feeding_time'], unique=False)
    op.create_index('idx_feeding_baby_time', 'feedings', ['baby_id', 'feeding_time'], unique=False)

    # sleeps
    op.create_table(
        'sleeps',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_sleeps_id', 'sleeps', ['id'], unique=False)
    op.create_index('ix_sleeps_start_time', 'sleeps', ['start_time'], unique=False)
    op.create_index('idx_sleep_baby_start_time', 'sleeps', ['baby_id', 'start_time'], unique=False)

    # diapers
    op.create_table(
        'diapers',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('change_time', sa.DateTime(), nullable=False),
        sa.Column('diaper_type', sa.Enum('WET', 'DIRTY', 'BOTH', name='diapertype'), nullable=False),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_diapers_id', 'diapers', ['id'], unique=False)
    op.create_index('ix_diapers_change_time', 'diapers', ['change_time'], unique=False)
    op.create_index('idx_diaper_baby_time', 'diapers', ['baby_id', 'change_time'], unique=False)

    # growths
    op.create_table(
        'growths',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('measurement_date', sa.Date(), nullable=False),
        sa.Column('weight_kg', sa.Float(), nullable=True),
        sa.Column('height_cm', sa.Float(), nullable=True),
        sa.Column('head_circumference_cm', sa.Float(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_growths_id', 'growths', ['id'], unique=False)
    op.create_index('ix_growths_measurement_date', 'growths', ['measurement_date'], unique=False)

    # contractions
    op.create_table(
        'contractions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('interval_seconds', sa.Integer(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_contractions_id', 'contractions', ['id'], unique=False)
    op.create_index('ix_contractions_start_time', 'contractions', ['start_time'], unique=False)

    # schedules
    op.create_table(
        'schedules',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('scheduled_time', sa.DateTime(), nullable=False),
        sa.Column('is_completed', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_schedules_id', 'schedules', ['id'], unique=False)
    op.create_index('ix_schedules_scheduled_time', 'schedules', ['scheduled_time'], unique=False)


def downgrade() -> None:
    op.drop_table('schedules')
    op.drop_table('contractions')
    op.drop_table('growths')
    op.drop_table('diapers')
    op.drop_table('sleeps')
    op.drop_table('feedings')
    op.drop_table('baby_permissions')
    op.drop_table('babies')
    op.drop_table('user_sessions')
    op.drop_table('family_users')
    op.drop_table('users')
    op.drop_table('families')
    sa.Enum(name='feedingtype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='diapertype').drop(op.get_bind(), checkfirst=True)
