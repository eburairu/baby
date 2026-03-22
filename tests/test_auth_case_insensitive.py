import pytest

def test_join_family_lowercase_fails(client):
    # 1. Register family (generates uppercase invite code)
    res = client.post(
        "/api/auth/register/family",
        json={"name": "Case Test Family", "username": "admin_case", "password": "password123"}
    )
    assert res.status_code == 200
    invite_code = res.json()["invite_code"]

    # Verify invite code is uppercase (as per previous fix)
    # isupper() は letter を含まない文字列（全数字 hex など）で False を返すため == upper() で比較する
    assert invite_code == invite_code.upper()

    # 2. Join family with lowercase invite code
    # This should fail if the backend does not normalize input
    lowercase_code = invite_code.lower()

    # Logout admin
    client.cookies.clear()

    response = client.post(
        f"/api/auth/register/join?invite_code={lowercase_code}",
        json={
            "username": "member_case",
            "password": "password123"
        }
    )

    # Expect success (200 OK) because the backend should handle case-insensitive input
    assert response.status_code == 200
    assert response.json()["username"] == "member_case"
