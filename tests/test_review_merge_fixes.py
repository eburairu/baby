"""
/review-merge コードレビューで検出されたバグの修正テスト

対象:
1. soft_delete_family - soft_delete_baby が commit を持つと中途コミットが発生する問題
   → soft_delete_baby から commit を除去し、呼び出し元（baby.py / soft_delete_family）が commit する

注: admin family detail の is_deleted フィルタ問題は database.py の do_orm_execute
    グローバルフィルタにより既に解消済みのため対象外。
    ensure_aware() の timezone fix は既存の test_invite_code_expiry.py がカバー済み。
"""
import pytest
from app.models.baby import Baby
from app.models.family import Family


def test_soft_delete_family_deletes_all_babies(auth_client, db):
    """
    複数の赤ちゃんがいる家族を論理削除したとき、
    すべての赤ちゃんが is_deleted=True になること。
    """
    from app.services.family import soft_delete_family

    c = auth_client(username="familydel_user", password="password123", family_name="削除テスト家族")

    res1 = c.post("/api/babies/", json={"name": "太郎", "birthday": "2023-01-01"})
    assert res1.status_code == 200
    baby_id1 = res1.json()["id"]

    res2 = c.post("/api/babies/", json={"name": "花子", "birthday": "2023-06-01"})
    assert res2.status_code == 200
    baby_id2 = res2.json()["id"]

    baby1 = db.query(Baby).execution_options(include_deleted=True).filter(Baby.id == baby_id1).first()
    family = db.query(Family).filter(Family.id == baby1.family_id).first()
    assert family is not None

    soft_delete_family(db, family)

    db.expire_all()
    baby1_after = db.query(Baby).execution_options(include_deleted=True).filter(Baby.id == baby_id1).first()
    baby2_after = db.query(Baby).execution_options(include_deleted=True).filter(Baby.id == baby_id2).first()
    assert baby1_after.is_deleted is True, "baby1 should be soft-deleted"
    assert baby2_after.is_deleted is True, "baby2 should be soft-deleted"

    db.expire_all()
    family_after = db.query(Family).execution_options(include_deleted=True).filter(Family.id == family.id).first()
    assert family_after.is_deleted is True, "family should be soft-deleted"


def test_single_baby_soft_delete_via_api_still_works(auth_client, db):
    """
    API 経由の赤ちゃん単体削除後、DB に is_deleted=True で残っていること。
    soft_delete_baby の commit を baby.py ルーターに移動した後も
    単体削除が正常動作することを確認する。
    """
    c = auth_client(username="babydel_user", password="password123")
    res = c.post("/api/babies/", json={"name": "一郎", "birthday": "2024-03-01"})
    assert res.status_code == 200
    baby_id = res.json()["id"]

    resp = c.delete(f"/api/babies/{baby_id}")
    assert resp.status_code == 204

    db.expire_all()
    baby = db.query(Baby).execution_options(include_deleted=True).filter(Baby.id == baby_id).first()
    assert baby is not None
    assert baby.is_deleted is True
