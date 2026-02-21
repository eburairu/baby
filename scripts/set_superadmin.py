import argparse
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User

def set_superadmin(user_id: int, is_superadmin: bool):
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not found in .env")
        return

    engine = create_engine(database_url)
    Session = sessionmaker(bind=engine)
    session = Session()

    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        print(f"User with ID {user_id} not found.")
        session.close()
        return

    user.is_superadmin = is_superadmin
    session.commit()
    print(f"User {user.username} (ID: {user_id}) is_superadmin set to {is_superadmin}.")
    session.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Set a user as SuperAdmin.")
    parser.add_argument("--user-id", type=int, required=True, help="The ID of the user.")
    parser.add_argument("--unset", action="store_true", help="Unset SuperAdmin status.")
    
    args = parser.parse_args()
    set_superadmin(args.user_id, not args.unset)
