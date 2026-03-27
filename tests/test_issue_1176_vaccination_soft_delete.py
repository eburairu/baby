"""
Issue #1176: ワクチン取得APIで論理削除済みレコードが返却されるバグのテスト
"""
from datetime import date
from app.models.vaccination import Vaccination, VaccinationStatus
from app.models.baby import Baby
from app.models.family import FamilyUser


def setup_test_data(auth_client, db):
    client = auth_client(username="vax1176user", password="password123")
    response_me = client.get("/api/auth/me")
    user_id = response_me.json()["id"]
    fu = db.query(FamilyUser).filter(FamilyUser.user_id == user_id).first()

    baby = Baby(family_id=fu.family_id, name="Vax1176 Baby", birthday=date(2026, 1, 1))
    db.add(baby)
    db.commit()
    db.refresh(baby)
    return client, baby, user_id


def test_get_vaccinations_excludes_soft_deleted(auth_client, db):
    """論理削除済みレコードが一覧に返却されないこと"""
    client, baby, _ = setup_test_data(auth_client, db)

    # レコード作成
    resp = client.post(f"/api/vaccinations/?baby_id={baby.id}", json={
        "vaccine_name": "ShouldBeDeleted",
        "dose_number": 1,
        "scheduled_date": "2026-03-01"
    })
    assert resp.status_code == 201
    v_id = resp.json()["id"]

    # DBレベルで直接 is_deleted = True に設定（APIを経由せずに確実にバグを再現）
    db.query(Vaccination).filter(Vaccination.id == v_id).update({"is_deleted": True})
    db.flush()

    # 一覧取得 — 削除済みが含まれていないことを確認
    list_resp = client.get(f"/api/vaccinations/?baby_id={baby.id}")
    assert list_resp.status_code == 200
    ids = [v["id"] for v in list_resp.json()]
    assert v_id not in ids, f"論理削除済みレコード(id={v_id})が一覧に含まれている"


def test_generate_vaccinations_works_after_all_deleted(auth_client, db):
    """全ワクチンレコードが論理削除済みの場合、新規生成が成功すること"""
    client, baby, _ = setup_test_data(auth_client, db)

    # DBレベルで直接 is_deleted=True のレコードを挿入（既に削除済みのスケジュールが存在する状態を再現）
    v = Vaccination(
        baby_id=baby.id,
        user_id=None,
        vaccine_name="OldVaccine",
        dose_number=1,
        scheduled_date=date(2026, 1, 1),
        is_deleted=True,
    )
    db.add(v)
    db.flush()

    # 再生成 — 論理削除済みのみなので成功するはず
    regen_resp = client.post(f"/api/vaccinations/generate?baby_id={baby.id}")
    assert regen_resp.status_code == 200, (
        f"論理削除済みレコードのみが存在する場合に generate が失敗した: {regen_resp.json()}"
    )
    assert len(regen_resp.json()) > 0
