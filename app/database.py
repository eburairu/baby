from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, with_loader_criteria, Session as ORMSession
from sqlalchemy.pool import NullPool
from app.models.base import SoftDeleteMixin

import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"options": "-c timezone=Asia/Tokyo"},
    poolclass=NullPool,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@event.listens_for(ORMSession, "do_orm_execute")
def _add_soft_delete_filter(execute_state):
    if (
        execute_state.is_select
        and not execute_state.execution_options.get("include_deleted", False)
    ):
        execute_state.statement = execute_state.statement.options(
            with_loader_criteria(
                SoftDeleteMixin,
                lambda cls: cls.is_deleted == False,
                include_aliases=True
            )
        )
