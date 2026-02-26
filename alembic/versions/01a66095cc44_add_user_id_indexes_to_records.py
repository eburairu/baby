"""add_user_id_indexes_to_records

Revision ID: 01a66095cc44
Revises: 5c7e95cda081
Create Date: 2026-02-27 05:30:14.082708+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '01a66095cc44'
down_revision: Union[str, Sequence[str], None] = '5c7e95cda081'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index(op.f('ix_feedings_user_id'), 'feedings', ['user_id'], unique=False)
    op.create_index(op.f('ix_sleeps_user_id'), 'sleeps', ['user_id'], unique=False)
    op.create_index(op.f('ix_diapers_user_id'), 'diapers', ['user_id'], unique=False)
    op.create_index(op.f('ix_growths_user_id'), 'growths', ['user_id'], unique=False)
    op.create_index(op.f('ix_notes_user_id'), 'notes', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_notes_user_id'), table_name='notes')
    op.drop_index(op.f('ix_growths_user_id'), table_name='growths')
    op.drop_index(op.f('ix_diapers_user_id'), table_name='diapers')
    op.drop_index(op.f('ix_sleeps_user_id'), table_name='sleeps')
    op.drop_index(op.f('ix_feedings_user_id'), table_name='feedings')
