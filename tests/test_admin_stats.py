import pytest
from sqlalchemy import event
from app.database import SessionLocal
from app.models.user import User

def test_admin_stats_query_count(auth_client, db):
    # 1. Setup admin user
    client = auth_client(username="adminuser_stats", password="password123")
    admin_user = db.query(User).filter(User.username == "adminuser_stats").first()
    admin_user.is_superadmin = True
    db.commit()

    # 2. Setup query counter
    query_count = 0
    def count_queries(conn, cursor, statement, parameters, context, executemany):
        nonlocal query_count
        # Ignore SAVEPOINT statements which might be emitted automatically
        if not statement.startswith("SAVEPOINT") and not statement.startswith("RELEASE SAVEPOINT"):
            query_count += 1

    engine = db.get_bind()
    event.listen(engine, "before_cursor_execute", count_queries)

    try:
        # 3. Call endpoint
        response = client.get("/api/admin/stats")
        
        # 4. Assert response
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_records" in data
        
        # Currently, there are 9 counts + 1 active users + perhaps auth queries.
        # We want to optimize this. The target is likely around 2-3 queries total for stats.
        # Auth might take 1-2 queries. Let's assert that the stats queries are minimal.
        # We can assert query_count <= 5 (Auth + optimized stats)
        # If it's not optimized, query_count will be > 10.
        assert query_count <= 5, f"Too many queries: {query_count}"
    finally:
        event.remove(engine, "before_cursor_execute", count_queries)
