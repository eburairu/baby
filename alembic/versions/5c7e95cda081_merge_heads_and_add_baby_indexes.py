"""merge heads for bolt

Revision ID: 5c7e95cda081
Revises: 7742386a8a71, e4f5g6h7i8j9
Create Date: 2026-02-24 05:03:14.071768+09:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5c7e95cda081'
down_revision: Union[str, Sequence[str], None] = ('7742386a8a71', 'e4f5g6h7i8j9')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index(op.f('ix_babies_family_id'), 'babies', ['family_id'], unique=False)
    op.create_index(op.f('ix_baby_permissions_user_id'), 'baby_permissions', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_baby_permissions_user_id'), table_name='baby_permissions')
    op.drop_index(op.f('ix_babies_family_id'), table_name='babies')
