
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("DATABASE_URL is not set.")
    exit(1)

engine = create_engine(database_url)
with engine.connect() as conn:
    print("Dropping alembic_version table...")
    conn.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE'))
    conn.commit()
    print("Successfully dropped alembic_version table.")
