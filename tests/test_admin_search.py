import pytest
from app.models.user import User
from app.models.family import Family
from app.models.family import FamilyUser, UserRole

def test_admin_search_wildcard_escaping(auth_client, db):
    # 1. Register and login as admin user
    client = auth_client(username="admin_search", password="password123", family_name="Admin Family")

    # 2. Promote to superadmin
    admin_user = db.query(User).filter(User.username == "admin_search").first()
    admin_user.is_superadmin = True
    db.commit()

    # 3. Create test data (families with special characters in names)
    # Family 1: Contains underscore
    f1 = Family(name="test_family", invite_code="code1")
    db.add(f1)

    # Family 2: Contains percent
    f2 = Family(name="test%family", invite_code="code2")
    db.add(f2)

    # Family 3: Similar name but with space (should NOT match underscore search if escaped)
    f3 = Family(name="test family", invite_code="code3")
    db.add(f3)

    # Family 4: Similar name but without percent
    f4 = Family(name="testfamily", invite_code="code4")
    db.add(f4)

    db.commit()

    # Test 1: Search for underscore literal "test_family"
    # If not escaped, "_" matches any single character, so "test family" would also match.
    response = client.get("/api/admin/families", params={"search": "test_family"})
    assert response.status_code == 200
    data = response.json()
    names = [f["name"] for f in data]

    assert "test_family" in names
    assert "test family" not in names, "Underscore should be treated as a literal, not a wildcard"

    # Test 2: Search for percent literal "test%family"
    # If not escaped, "%" matches any string, so "testfamily" and "test_family" would also match.
    response = client.get("/api/admin/families", params={"search": "test%family"})
    assert response.status_code == 200
    data = response.json()
    names = [f["name"] for f in data]

    assert "test%family" in names
    assert "testfamily" not in names, "Percent should be treated as a literal, not a wildcard"
    assert "test_family" not in names


def test_admin_search_max_length(auth_client, db):
    # 1. Register and login as admin user
    client = auth_client(username="admin_len", password="password123", family_name="Admin Family")

    # 2. Promote to superadmin
    admin_user = db.query(User).filter(User.username == "admin_len").first()
    admin_user.is_superadmin = True
    db.commit()

    # 3. Test search query length > 100 characters
    long_search = "a" * 101
    response = client.get("/api/admin/families", params={"search": long_search})

    # Expect validation error (422 Unprocessable Entity)
    assert response.status_code == 422

    # 4. Test exactly 100 characters (should pass)
    long_search_ok = "a" * 100
    response = client.get("/api/admin/families", params={"search": long_search_ok})
    assert response.status_code == 200
