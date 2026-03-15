import sys
import os

# app ディレクトリをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.models.user import User
from app.models.family import Family, FamilyUser
from app.routers.family import get_family_members

from testcontainers.postgres import PostgresContainer
import atexit

postgres = PostgresContainer("postgres:16-alpine")
postgres.start()
atexit.register(postgres.stop)

SQLALCHEMY_DATABASE_URL = postgres.get_connection_url()
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Create a family
    family = Family(name="Test Family", invite_code="testcode")
    db.add(family)
    db.commit()
    db.refresh(family)

    current_user_id = None
    # Create users and add them to the family
    for i in range(5):
        user = User(username=f"user{i}", hashed_password="hashed_password")
        db.add(user)
        db.commit()
        db.refresh(user)

        # Make the first user the current user
        if i == 0:
            current_user_id = user.id

        family_user = FamilyUser(family_id=family.id, user_id=user.id, role="member")
        db.add(family_user)
        db.commit()

    db.close()
    return current_user_id

def run_test():
    current_user_id = setup_db()

    db = TestingSessionLocal()

    # Retrieve current user object
    current_user = db.query(User).filter(User.id == current_user_id).first()

    # Query counting setup
    query_count = 0

    def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        nonlocal query_count
        query_count += 1
        # print(f"Query: {statement}")

    event.listen(engine, "before_cursor_execute", receive_before_cursor_execute)

    print("--- Starting Test ---")

    try:
        # Call the actual router function
        members = get_family_members(db, current_user)

        print(f"Function executed. Members count: {len(members)}")
        print(f"Total queries executed: {query_count}")

        # Expectation:
        # 1. Fetch family_user for current_user (in _get_family_user) -> 1 query
        # 2. Fetch members (with joined users) -> 1 query
        # Total should be around 2 queries.
        # Definitely should not be 1 + 1 + 5 = 7 queries.

        if query_count > 3:
            print("FAIL: N+1 query detected!")
        else:
            print("PASS: No N+1 query detected.")

    finally:
        event.remove(engine, "before_cursor_execute", receive_before_cursor_execute)

if __name__ == "__main__":
    run_test()
