"""Add relatives table

Revision ID: o1p2q3r4
Revises: n1o2p3q4
Create Date: 2026-03-25 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'o1p2q3r4'
down_revision = 'n1o2p3q4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'relatives',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column(
            'relationship_type',
            sa.Enum(
                'father', 'mother',
                'paternal_grandfather', 'paternal_grandmother',
                'maternal_grandfather', 'maternal_grandmother',
                'paternal_uncle', 'paternal_aunt',
                'maternal_uncle', 'maternal_aunt',
                'older_brother', 'older_sister',
                'younger_brother', 'younger_sister',
                name='relationshiptype',
            ),
            nullable=False,
        ),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_relatives_id', 'relatives', ['id'], unique=False)
    op.create_index('ix_relatives_baby_id', 'relatives', ['baby_id'], unique=False)
    op.create_index('ix_relatives_user_id', 'relatives', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_relatives_user_id', table_name='relatives')
    op.drop_index('ix_relatives_baby_id', table_name='relatives')
    op.drop_index('ix_relatives_id', table_name='relatives')
    op.drop_table('relatives')
    op.execute("DROP TYPE IF EXISTS relationshiptype")
