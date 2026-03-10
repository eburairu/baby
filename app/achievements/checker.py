"""
実績チェッカー。各記録作成後に呼び出し、新たに解除された実績を返す。
"""
import logging
from datetime import timedelta, date
from typing import Any

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.achievements.definitions import ACHIEVEMENTS, AchievementDef
from app.models.achievement import BabyAchievement
from app.models.baby import Baby
from app.models.diaper import Diaper
from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.growth import Growth
from app.models.milestone import Milestone
from app.models.family import FamilyUser
from app.models.enums import DiaperType
from app.utils.timezone import JST

logger = logging.getLogger(__name__)


def _already_awarded(baby_id: int, achievement_id: str, db: Session) -> bool:
    return db.query(BabyAchievement).filter(
        BabyAchievement.baby_id == baby_id,
        BabyAchievement.achievement_id == achievement_id,
    ).first() is not None


def _award(baby_id: int, achievement_id: str, user_id: int, db: Session) -> BabyAchievement:
    row = BabyAchievement(
        baby_id=baby_id,
        achievement_id=achievement_id,
        triggered_by_user_id=user_id,
    )
    db.add(row)
    db.flush()  # IDを確定させるが、コミットは呼び出し元が行う
    return row


def _check_and_award(
    baby_id: int,
    achievement_id: str,
    user_id: int,
    db: Session,
    results: list[dict],
) -> None:
    """未解除ならアワードして results に追加する"""
    if _already_awarded(baby_id, achievement_id, db):
        return
    _award(baby_id, achievement_id, user_id, db)
    defn: AchievementDef = ACHIEVEMENTS[achievement_id]
    results.append({
        "achievement_id": achievement_id,
        "name": defn.name,
        "icon": defn.icon,
        "category": defn.category,
        "rarity": defn.rarity,
        "description": defn.description,
    })


# ─── 記録タイプ別チェック ─────────────────────────────────────────

def _check_diaper(
    baby_id: int,
    user_id: int,
    record: Diaper,
    db: Session,
    results: list[dict],
) -> None:
    change_time = record.change_time

    # 回数系
    total = db.query(func.count(Diaper.id)).filter(
        Diaper.baby_id == baby_id,
        Diaper.is_deleted == False,
    ).scalar() or 0
    for milestone_count, achievement_id in [(10, "diaper_10"), (100, "diaper_100"), (500, "diaper_500")]:
        if total >= milestone_count:
            _check_and_award(baby_id, achievement_id, user_id, db, results)

    # quick_redirty: 5分以内に前回のおむつ交換がある
    five_min_ago = change_time - timedelta(minutes=5)
    prev = db.query(Diaper).filter(
        Diaper.baby_id == baby_id,
        Diaper.id != record.id,
        Diaper.change_time >= five_min_ago,
        Diaper.change_time < change_time,
        Diaper.is_deleted == False,
    ).first()
    if prev:
        _check_and_award(baby_id, "quick_redirty", user_id, db, results)

    # blowout: 1時間以内に3回以上
    one_hour_ago = change_time - timedelta(hours=1)
    count_1h = db.query(func.count(Diaper.id)).filter(
        Diaper.baby_id == baby_id,
        Diaper.change_time >= one_hour_ago,
        Diaper.change_time <= change_time,
        Diaper.is_deleted == False,
    ).scalar() or 0
    if count_1h >= 3:
        _check_and_award(baby_id, "blowout", user_id, db, results)

    # double_diaper: 24時間以内に15回以上
    day_ago = change_time - timedelta(hours=24)
    count_24h = db.query(func.count(Diaper.id)).filter(
        Diaper.baby_id == baby_id,
        Diaper.change_time >= day_ago,
        Diaper.change_time <= change_time,
        Diaper.is_deleted == False,
    ).scalar() or 0
    if count_24h >= 15:
        _check_and_award(baby_id, "double_diaper", user_id, db, results)

    # poop_timing: うんち系 + 授乳終了直後（10分以内）
    if record.diaper_type in (DiaperType.DIRTY, DiaperType.BOTH):
        ten_min_ago = change_time - timedelta(minutes=10)
        # feeding_time + duration_minutes を授乳終了時刻とみなす
        recent_feeding = db.query(Feeding).filter(
            Feeding.baby_id == baby_id,
            Feeding.is_deleted == False,
            Feeding.duration_minutes.isnot(None),
        ).filter(
            Feeding.feeding_time >= ten_min_ago - timedelta(minutes=60),
            Feeding.feeding_time <= change_time,
        ).all()
        for f in recent_feeding:
            if f.duration_minutes:
                end_time = f.feeding_time + timedelta(minutes=f.duration_minutes)
                if ten_min_ago <= end_time <= change_time:
                    _check_and_award(baby_id, "poop_timing", user_id, db, results)
                    break


def _check_feeding(
    baby_id: int,
    user_id: int,
    record: Feeding,
    db: Session,
    results: list[dict],
) -> None:
    feeding_time = record.feeding_time

    # 回数系
    total = db.query(func.count(Feeding.id)).filter(
        Feeding.baby_id == baby_id,
        Feeding.is_deleted == False,
    ).scalar() or 0
    for milestone_count, achievement_id in [(10, "feeding_10"), (100, "feeding_100"), (500, "feeding_500")]:
        if total >= milestone_count:
            _check_and_award(baby_id, achievement_id, user_id, db, results)

    # midnight_feeding: 0〜4時
    hour_jst = feeding_time.astimezone(JST).hour
    if 0 <= hour_jst < 4:
        _check_and_award(baby_id, "midnight_feeding", user_id, db, results)

    # dawn_patrol: 4〜6時
    if 4 <= hour_jst < 6:
        _check_and_award(baby_id, "dawn_patrol", user_id, db, results)

    # marathon_feeding: 30分以上
    if record.duration_minutes and record.duration_minutes >= 30:
        _check_and_award(baby_id, "marathon_feeding", user_id, db, results)


def _check_sleep(
    baby_id: int,
    user_id: int,
    record: Sleep,
    db: Session,
    results: list[dict],
) -> None:
    # long_sleep: 連続6時間以上（end_time がある場合のみ）
    if record.end_time and record.start_time:
        duration_hours = (record.end_time - record.start_time).total_seconds() / 3600
        if duration_hours >= 6:
            _check_and_award(baby_id, "long_sleep", user_id, db, results)

    # fragmented_sleep: 当日6回以上の睡眠記録
    record_date = record.start_time.astimezone(JST).date()
    day_start = JST.localize(
        record.start_time.astimezone(JST).replace(hour=0, minute=0, second=0, microsecond=0).replace(tzinfo=None)
    )
    day_end = day_start + timedelta(days=1)
    count_today = db.query(func.count(Sleep.id)).filter(
        Sleep.baby_id == baby_id,
        Sleep.start_time >= day_start,
        Sleep.start_time < day_end,
        Sleep.is_deleted == False,
    ).scalar() or 0
    if count_today >= 6:
        _check_and_award(baby_id, "fragmented_sleep", user_id, db, results)


def _check_growth(
    baby_id: int,
    user_id: int,
    record: Growth,
    db: Session,
    results: list[dict],
) -> None:
    if record.weight is None:
        return

    # weight_5kg / weight_10kg
    if record.weight >= 5000:
        _check_and_award(baby_id, "weight_5kg", user_id, db, results)
    if record.weight >= 10000:
        _check_and_award(baby_id, "weight_10kg", user_id, db, results)

    # weight_double: 最初の体重記録の2倍
    first_growth = db.query(Growth).filter(
        Growth.baby_id == baby_id,
        Growth.weight.isnot(None),
        Growth.is_deleted == False,
    ).order_by(Growth.date.asc()).first()
    if first_growth and first_growth.weight and record.weight >= first_growth.weight * 2 and first_growth.id != record.id:
        _check_and_award(baby_id, "weight_double", user_id, db, results)


def _check_temperature(
    baby_id: int,
    user_id: int,
    record: Any,
    db: Session,
    results: list[dict],
) -> None:
    # fever_night: 38度以上 + 深夜（22時〜翌6時）
    if record.temperature >= 38.0:
        hour_jst = record.measured_at.astimezone(JST).hour
        if hour_jst >= 22 or hour_jst < 6:
            _check_and_award(baby_id, "fever_night", user_id, db, results)


def _check_milestone(
    baby_id: int,
    user_id: int,
    db: Session,
    results: list[dict],
) -> None:
    count = db.query(func.count(Milestone.id)).filter(
        Milestone.baby_id == baby_id,
        Milestone.is_deleted == False,
    ).scalar() or 0
    if count >= 1:
        _check_and_award(baby_id, "first_milestone", user_id, db, results)


def _check_birthday_milestones(
    baby_id: int,
    user_id: int,
    db: Session,
    results: list[dict],
) -> None:
    baby = db.query(Baby).filter(Baby.id == baby_id).first()
    if not baby or not baby.birthday:
        return
    today = date.today()
    delta_days = (today - baby.birthday).days

    for min_days, achievement_id in [
        (30, "one_month"),
        (90, "three_months"),
        (180, "half_year"),
        (365, "first_birthday"),
    ]:
        if delta_days >= min_days:
            _check_and_award(baby_id, achievement_id, user_id, db, results)


def _check_family_participation(
    baby_id: int,
    user_id: int,
    db: Session,
    results: list[dict],
) -> None:
    # ファミリー全記録からユニーク記録者数を取得（授乳ベース）
    distinct_users = db.query(func.count(func.distinct(Feeding.user_id))).filter(
        Feeding.baby_id == baby_id,
        Feeding.is_deleted == False,
    ).scalar() or 0

    # おむつも含めて重複排除
    if distinct_users < 2:
        from sqlalchemy import union_all, literal_column, select as sa_select
        feeding_users = sa_select(Feeding.user_id.label("uid")).where(
            Feeding.baby_id == baby_id,
            Feeding.is_deleted == False,
        )
        diaper_users = sa_select(Diaper.user_id.label("uid")).where(
            Diaper.baby_id == baby_id,
            Diaper.is_deleted == False,
        )
        subq = union_all(feeding_users, diaper_users).subquery()
        distinct_users = db.query(func.count(func.distinct(subq.c.uid))).scalar() or 0

    if distinct_users >= 2:
        _check_and_award(baby_id, "partner_records", user_id, db, results)
    if distinct_users >= 3:
        _check_and_award(baby_id, "family_records", user_id, db, results)

    # days_100: 授乳記録のある日が100日以上
    distinct_days = db.query(func.count(func.distinct(func.date(Feeding.feeding_time)))).filter(
        Feeding.baby_id == baby_id,
        Feeding.is_deleted == False,
    ).scalar() or 0
    if distinct_days >= 100:
        _check_and_award(baby_id, "days_100", user_id, db, results)


# ─── 公開エントリーポイント ───────────────────────────────────────

def check_and_award_achievements(
    baby_id: int,
    record_type: str,
    user_id: int,
    db: Session,
    record: Any = None,
) -> list[dict]:
    """
    記録作成後に呼び出す。新たに解除された実績のリストを返す。
    呼び出し元でコミットすること（checker内はflushのみ）。
    """
    results: list[dict] = []
    # SAVEPOINT を使うことで、checkerのエラーがメインのトランザクションに影響しない
    savepoint = db.begin_nested()
    try:
        if record_type == "diaper" and record is not None:
            _check_diaper(baby_id, user_id, record, db, results)
        elif record_type == "feeding" and record is not None:
            _check_feeding(baby_id, user_id, record, db, results)
        elif record_type == "sleep" and record is not None:
            _check_sleep(baby_id, user_id, record, db, results)
        elif record_type == "growth" and record is not None:
            _check_growth(baby_id, user_id, record, db, results)
        elif record_type == "temperature" and record is not None:
            _check_temperature(baby_id, user_id, record, db, results)
        elif record_type == "milestone":
            _check_milestone(baby_id, user_id, db, results)

        # 全記録タイプ共通チェック
        _check_birthday_milestones(baby_id, user_id, db, results)
        _check_family_participation(baby_id, user_id, db, results)

        savepoint.commit()
    except Exception as e:
        logger.error(f"Achievement check failed for baby_id={baby_id}, type={record_type}: {e}", exc_info=True)
        savepoint.rollback()  # checkerのflushのみロールバック。呼び出し元には影響しない
        return []

    return results
