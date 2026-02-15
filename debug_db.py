
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
        
        # Inspect tables
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Tables: {tables}")
        
        if "user_sessions" in tables:
            print("user_sessions table exists.")
        else:
            print("user_sessions table MISSING!")
            
        # Check alembic version
        result = connection.execute(text("SELECT * FROM alembic_version"))
        version = result.fetchone()
        print(f"Alembic version: {version}")
        
        # RESET DB VERSION if tables are missing
        if "babies" not in tables and version:
            print("Tables missing but version present. Resetting alembic_version...")
            connection.execute(text("DELETE FROM alembic_version"))
            connection.commit()
            print("alembic_version cleared.")
        
except Exception as e:
    print(f"Connection failed: {e}")
