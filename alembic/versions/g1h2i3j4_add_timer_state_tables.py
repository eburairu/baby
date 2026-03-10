"""add_timer_state_tables

Revision ID: g1h2i3j4
Revises: f2e3d4c5
Create Date: 2026-03-02

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'g1h2i3j4'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'contraction_timer_states',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='idle'),
        sa.Column('start_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('baby_id'),
    )
    op.create_index(op.f('ix_contraction_timer_states_id'), 'contraction_timer_states', ['id'], unique=False)

    op.create_table(
        'feeding_timer_states',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.Column('active_side', sa.String(), nullable=True),
        sa.Column('left_elapsed_seconds', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('right_elapsed_seconds', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('segment_start_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('baby_id'),
    )
    op.create_index(op.f('ix_feeding_timer_states_id'), 'feeding_timer_states', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_feeding_timer_states_id'), table_name='feeding_timer_states')
    op.drop_table('feeding_timer_states')
    op.drop_index(op.f('ix_contraction_timer_states_id'), table_name='contraction_timer_states')
    op.drop_table('contraction_timer_states')
