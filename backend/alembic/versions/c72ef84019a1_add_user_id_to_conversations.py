"""add user_id to conversations

Revision ID: c72ef84019a1
Revises: 34ebe30de435
Create Date: 2026-09-13 04:38:50.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c72ef84019a1'
down_revision: Union[str, None] = '34ebe30de435'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('conversations', sa.Column('user_id', sa.UUID(), nullable=True))
    op.create_foreign_key(
        'fk_conversations_user_id_users',
        'conversations',
        'users',
        ['user_id'],
        ['id'],
        ondelete='CASCADE',
    )


def downgrade() -> None:
    op.drop_constraint('fk_conversations_user_id_users', 'conversations', type_='foreignkey')
    op.drop_column('conversations', 'user_id')
