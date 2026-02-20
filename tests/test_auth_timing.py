import pytest

def test_login_timing_consistency(client):
    """
    Verify that login failure returns generic error message
    regardless of whether the username exists or not.
    This test ensures that we don't leak user existence via error messages.
    Note: We cannot reliably test timing differences in this environment,
    but we verify the functional behavior (same status code and detail).
    """

    # 1. Register a valid user
    client.post(
        "/api/auth/register/family",
        json={
            "name": "Timing Test Family",
            "username": "existing_user",
            "password": "correct_password1"
        }
    )
    client.cookies.clear() # Logout

    # 2. Attempt login with existing user + wrong password
    res_existing = client.post(
        "/api/auth/login",
        json={
            "username": "existing_user",
            "password": "wrong_password1"
        }
    )
    assert res_existing.status_code == 401
    assert res_existing.json()["detail"] == "Incorrect username or password"

    # 3. Attempt login with non-existing user
    res_non_existing = client.post(
        "/api/auth/login",
        json={
            "username": "non_existing_user",
            "password": "any_password1"
        }
    )
    assert res_non_existing.status_code == 401
    assert res_non_existing.json()["detail"] == "Incorrect username or password"
