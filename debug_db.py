
import os
from dotenv import load_dotenv
import sqlalchemy

print("Loading dotenv...")
load_dotenv()

db_url = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {db_url}")

if db_url:
    print(f"URL starts with: {db_url[:15]}...")
else:
    print("DATABASE_URL is None or empty")

try:
    from app.database import engine
    print(f"Engine URL: {engine.url}")
    print("Connecting...")
    with engine.connect() as connection:
        print("Connected!")
except Exception as e:
    print(f"Connection failed: {e}")
