import sys
import os

# app ディレクトリをパスに追加
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.models.user import User
from app.models.family import Family, FamilyUser
from app.models.baby import Baby, BabyPermission
from app.models.feeding import Feeding
from app.models.comment import RecordComment
from app.routers.comments import get_record_comments

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
    users = []
    # Create users and add them to the family
    for i in range(5):
        user = User(username=f"user{i}", hashed_password="hashed_password")
        db.add(user)
        db.commit()
        db.refresh(user)
        users.append(user)

        # Make the first user the current user
        if i == 0:
            current_user_id = user.id

        family_user = FamilyUser(family_id=family.id, user_id=user.id, role="member")
        db.add(family_user)
        db.commit()

    # Create baby
    baby = Baby(name="Test Baby", family_id=family.id)
    db.add(baby)
    db.commit()
    db.refresh(baby)

    # permission
    baby_perm = BabyPermission(user_id=current_user_id, baby_id=baby.id, record_type="baby", can_view=True)
    feeding_perm = BabyPermission(user_id=current_user_id, baby_id=baby.id, record_type="feeding", can_view=True)
    db.add(baby_perm)
    db.add(feeding_perm)
    db.commit()


    from datetime import datetime, timezone
    feeding = Feeding(user_id=current_user_id, baby_id=baby.id, feeding_time=datetime.now(timezone.utc), feeding_type="BREAST")
    db.add(feeding)
    db.commit()
    db.refresh(feeding)

    # create comments
    for i in range(20):
        comment = RecordComment(
            baby_id=baby.id,
            user_id=users[i%5].id,
            record_type="feeding",
            record_id=feeding.id,
            content=f"comment {i}"
        )
        db.add(comment)
    db.commit()

    return current_user_id, feeding.id

def run_test():
    current_user_id, record_id = setup_db()

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
        comments = get_record_comments("feeding", record_id, db, current_user)

        print(f"Function executed. Comments count: {len(comments)}")
        print(f"Total queries executed: {query_count}")

        if query_count > 6:
            print("FAIL: N+1 query detected!")
        else:
            print("PASS: No N+1 query detected.")

    finally:
        event.remove(engine, "before_cursor_execute", receive_before_cursor_execute)

if __name__ == "__main__":
    run_test()
