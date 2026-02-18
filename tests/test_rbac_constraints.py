"""
RBAC 制約に関するテスト。

rbac.md 仕様書の「未実装テスト」セクションに記載されたケースを網羅する。
"""
import pytest
from app.models.family import UserRole


# ---------------------------------------------------------------------------
# ヘルパー: ADMIN + VIEWER のセットアップ
# ---------------------------------------------------------------------------
def _setup_admin_and_viewer(client):
    """ADMIN が家族を作成し、赤ちゃんを登録。VIEWER が参加。
    戻り値: (admin_id, viewer_id, baby_id, invite_code)
    """
    # ADMIN が家族を作成
    client.post("/api/auth/register/family", json={
        "name": "RBAC Test Family",
        "username": "rbac_admin",
        "password": "password123",
    })
    # 赤ちゃんを登録
    res = client.post("/api/babies/", json={"name": "Baby", "gender": "boy"})
    baby_id = res.json()["id"]

    # 招待コード取得
    invite_code = client.get("/api/family/").json()["invite_code"]

    # ADMIN の user_id を取得
    admin_id = client.get("/api/auth/me").json()["id"]

    # VIEWER が参加
    client.cookies.clear()
    res = client.post(f"/api/auth/register/join?invite_code={invite_code}", json={
        "username": "rbac_viewer",
        "password": "password123",
    })
    viewer_id = res.json()["id"]

    return admin_id, viewer_id, baby_id, invite_code


def _login(client, username):
    """指定ユーザーでログインし直す。"""
    client.cookies.clear()
    client.post("/api/auth/login", json={"username": username, "password": "password123"})


# ---------------------------------------------------------------------------
# 1. 最終 ADMIN の降格拒否
# ---------------------------------------------------------------------------
def test_last_admin_demotion_rejected(client):
    admin_id, viewer_id, _, _ = _setup_admin_and_viewer(client)
    _login(client, "rbac_admin")

    res = client.patch(f"/api/family/members/{admin_id}/role", json={"role": UserRole.VIEWER})
    assert res.status_code == 400
    assert "At least one admin is required" in res.json()["detail"]


# ---------------------------------------------------------------------------
# 2. 最終 ADMIN の自己削除拒否
# ---------------------------------------------------------------------------
def test_last_admin_self_delete_rejected(client):
    admin_id, viewer_id, _, _ = _setup_admin_and_viewer(client)
    _login(client, "rbac_admin")

    res = client.delete(f"/api/family/members/{admin_id}")
    assert res.status_code == 400
    assert "At least one admin is required" in res.json()["detail"]


# ---------------------------------------------------------------------------
# 3. VIEWER がコメントを投稿できる
# ---------------------------------------------------------------------------
def test_viewer_can_post_comment(client):
    admin_id, viewer_id, baby_id, _ = _setup_admin_and_viewer(client)

    # ADMIN として授乳記録を作成
    _login(client, "rbac_admin")
    res = client.post("/api/feedings/", json={
        "baby_id": baby_id,
        "feeding_time": "2024-01-01T10:00:00",
        "feeding_type": "BOTTLE",
    })
    feeding_id = res.json()["id"]

    # VIEWER としてコメント投稿
    _login(client, "rbac_viewer")
    res = client.post(f"/api/records/feeding/{feeding_id}/comments", json={
        "content": "がんばってるね！",
    })
    assert res.status_code == 200
    assert res.json()["content"] == "がんばってるね！"
    assert res.json()["user_id"] == viewer_id


# ---------------------------------------------------------------------------
# 4. VIEWER が自分のコメントを削除できる
# ---------------------------------------------------------------------------
def test_viewer_can_delete_own_comment(client):
    admin_id, viewer_id, baby_id, _ = _setup_admin_and_viewer(client)

    # ADMIN として授乳記録を作成
    _login(client, "rbac_admin")
    res = client.post("/api/feedings/", json={
        "baby_id": baby_id,
        "feeding_time": "2024-01-01T10:00:00",
        "feeding_type": "BOTTLE",
    })
    feeding_id = res.json()["id"]

    # VIEWER としてコメント投稿
    _login(client, "rbac_viewer")
    res = client.post(f"/api/records/feeding/{feeding_id}/comments", json={
        "content": "応援コメント",
    })
    comment_id = res.json()["id"]

    # VIEWER が自分のコメントを削除
    res = client.delete(f"/api/comments/{comment_id}")
    assert res.status_code == 204


# ---------------------------------------------------------------------------
# 5. MEMBER / VIEWER が他者のコメントを削除できない
# ---------------------------------------------------------------------------
def test_member_cannot_delete_others_comment(client):
    admin_id, viewer_id, baby_id, invite_code = _setup_admin_and_viewer(client)

    # ADMIN として授乳記録を作成 & コメント投稿
    _login(client, "rbac_admin")
    res = client.post("/api/feedings/", json={
        "baby_id": baby_id,
        "feeding_time": "2024-01-01T10:00:00",
        "feeding_type": "BOTTLE",
    })
    feeding_id = res.json()["id"]
    res = client.post(f"/api/records/feeding/{feeding_id}/comments", json={
        "content": "ADMIN のコメント",
    })
    admin_comment_id = res.json()["id"]

    # VIEWER を MEMBER に昇格
    client.patch(f"/api/family/members/{viewer_id}/role", json={"role": UserRole.MEMBER})

    # MEMBER として他者のコメントを削除しようとする
    _login(client, "rbac_viewer")
    res = client.delete(f"/api/comments/{admin_comment_id}")
    assert res.status_code == 403
    assert "Not authorized" in res.json()["detail"]


# ---------------------------------------------------------------------------
# 6. 全ロールが通知エンドポイントにアクセスできる
# ---------------------------------------------------------------------------
def test_all_roles_can_access_notifications(client):
    admin_id, viewer_id, _, _ = _setup_admin_and_viewer(client)

    # VIEWER として通知設定にアクセス
    _login(client, "rbac_viewer")
    res = client.get("/api/notifications/settings")
    assert res.status_code == 200

    # ADMIN として通知設定にアクセス
    _login(client, "rbac_admin")
    res = client.get("/api/notifications/settings")
    assert res.status_code == 200
