"""
実績チェッカー。各記録作成後に呼び出し、新たに解除された実績を返す。
"""
import logging
from datetime import timedelta, date, datetime
from typing import Any

from sqlalchemy.orm import Session
from sqlalchemy import func, union_all, select as sa_select

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
from app.models.temperature import TemperatureRecord
from app.utils.timezone import JST, ensure_aware

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


# ─── ヘルパー ──────────────────────────────────────────────────────────────

def _check_special_dates(
    baby_id: int,
    user_id: int,
    record_time: datetime,
    db: Session,
    results: list[dict],
) -> None:
    """クリスマス・元旦の記録チェック"""
    jst_dt = record_time.astimezone(JST)
    if jst_dt.month == 12 and jst_dt.day == 25:
        _check_and_award(baby_id, "christmas_record", user_id, db, results)
    if jst_dt.month == 1 and jst_dt.day == 1:
        _check_and_award(baby_id, "new_year_record", user_id, db, results)


def _check_streak(
    baby_id: int,
    user_id: int,
    db: Session,
    results: list[dict],
) -> None:
    """連続記録日数チェック（授乳・おむつ・睡眠の日付を結合）"""
    feeding_dates = sa_select(func.date(Feeding.feeding_time).label("d")).where(
        Feeding.baby_id == baby_id,
        Feeding.is_deleted == False,
    )
    diaper_dates = sa_select(func.date(Diaper.change_time).label("d")).where(
        Diaper.baby_id == baby_id,
        Diaper.is_deleted == False,
    )
    sleep_dates = sa_select(func.date(Sleep.start_time).label("d")).where(
        Sleep.baby_id == baby_id,
        Sleep.is_deleted == False,
    )
    subq = union_all(feeding_dates, diaper_dates, sleep_dates).subquery()
    rows = db.query(subq.c.d).distinct().all()
    if not rows:
        return

    # date 文字列を date オブジェクトに変換してソート
    dates = sorted(
        {_parse_date(r[0]) for r in rows if r[0] is not None},
    )
    if not dates:
        return

    max_run = 1
    cur_run = 1
    for i in range(1, len(dates)):
        if (dates[i] - dates[i - 1]).days == 1:
            cur_run += 1
            max_run = max(max_run, cur_run)
        else:
            cur_run = 1

    if max_run >= 7:
        _check_and_award(baby_id, "week_streak", user_id, db, results)
    if max_run >= 30:
        _check_and_award(baby_id, "month_streak", user_id, db, results)


def _parse_date(value) -> date:
    """SQLite は date() を文字列で返すため、date オブジェクトに変換する"""
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        return date.fromisoformat(value[:10])
    # datetime の場合
    return value.date()


def _check_triple_record(
    baby_id: int,
    user_id: int,
    record_time: datetime,
    db: Session,
    results: list[dict],
) -> None:
    """1 時間ウィンドウ内に授乳・おむつ・睡眠が各 1 件以上あるかチェック"""
    window_start = record_time - timedelta(hours=1)
    window_end = record_time + timedelta(hours=1)

    has_feeding = db.query(Feeding.id).filter(
        Feeding.baby_id == baby_id,
        Feeding.feeding_time >= window_start,
        Feeding.feeding_time <= window_end,
        Feeding.is_deleted == False,
    ).first() is not None

    has_diaper = db.query(Diaper.id).filter(
        Diaper.baby_id == baby_id,
        Diaper.change_time >= window_start,
        Diaper.change_time <= window_end,
        Diaper.is_deleted == False,
    ).first() is not None

    has_sleep = db.query(Sleep.id).filter(
        Sleep.baby_id == baby_id,
        Sleep.start_time >= window_start,
        Sleep.start_time <= window_end,
        Sleep.is_deleted == False,
    ).first() is not None

    if has_feeding and has_diaper and has_sleep:
        _check_and_award(baby_id, "triple_record", user_id, db, results)


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
    for milestone_count, achievement_id in [
        (10, "diaper_10"),
        (100, "diaper_100"),
        (500, "diaper_500"),
        (1000, "diaper_1000"),
    ]:
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
    # blowout_pro: 1時間以内に5回以上
    if count_1h >= 5:
        _check_and_award(baby_id, "blowout_pro", user_id, db, results)

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

    # midnight_diaper: 深夜 0〜4 時
    if change_time.astimezone(JST).hour < 4:
        _check_and_award(baby_id, "midnight_diaper", user_id, db, results)

    # clean_swap: CLEAN タイプ
    if record.diaper_type == DiaperType.CLEAN:
        _check_and_award(baby_id, "clean_swap", user_id, db, results)

    _check_special_dates(baby_id, user_id, change_time, db, results)
    _check_triple_record(baby_id, user_id, change_time, db, results)


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
    for milestone_count, achievement_id in [
        (10, "feeding_10"),
        (100, "feeding_100"),
        (500, "feeding_500"),
        (1000, "feeding_1000"),
    ]:
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

    # super_marathon: 60分以上
    if record.duration_minutes and record.duration_minutes >= 60:
        _check_and_award(baby_id, "super_marathon", user_id, db, results)

    # back_to_back: 前回授乳終了から1時間以内
    one_hour_ago = feeding_time - timedelta(hours=2)  # 最大1h授乳 + 1h間隔を考慮
    prev_feedings = db.query(Feeding).filter(
        Feeding.baby_id == baby_id,
        Feeding.id != record.id,
        Feeding.feeding_time >= one_hour_ago,
        Feeding.feeding_time < feeding_time,
        Feeding.duration_minutes.isnot(None),
        Feeding.is_deleted == False,
    ).all()
    for pf in prev_feedings:
        if pf.duration_minutes:
            prev_end = ensure_aware(pf.feeding_time) + timedelta(minutes=pf.duration_minutes)
            if prev_end <= feeding_time and (feeding_time - prev_end) <= timedelta(hours=1):
                _check_and_award(baby_id, "back_to_back", user_id, db, results)
                break

    _check_special_dates(baby_id, user_id, feeding_time, db, results)
    _check_triple_record(baby_id, user_id, feeding_time, db, results)


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
        # golden_sleep: 連続8時間以上
        if duration_hours >= 8:
            _check_and_award(baby_id, "golden_sleep", user_id, db, results)
        # power_nap: 30分未満
        if duration_hours < 0.5:
            _check_and_award(baby_id, "power_nap", user_id, db, results)

    # 睡眠総件数チェック
    total_sleep = db.query(func.count(Sleep.id)).filter(
        Sleep.baby_id == baby_id,
        Sleep.is_deleted == False,
    ).scalar() or 0
    if total_sleep >= 10:
        _check_and_award(baby_id, "sleep_10", user_id, db, results)
    if total_sleep >= 100:
        _check_and_award(baby_id, "sleep_100", user_id, db, results)

    # fragmented_sleep: 当日6回以上の睡眠記録
    jst_dt = record.start_time.astimezone(JST)
    day_start = jst_dt.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)
    count_today = db.query(func.count(Sleep.id)).filter(
        Sleep.baby_id == baby_id,
        Sleep.start_time >= day_start,
        Sleep.start_time < day_end,
        Sleep.is_deleted == False,
    ).scalar() or 0
    if count_today >= 6:
        _check_and_award(baby_id, "fragmented_sleep", user_id, db, results)
    # extreme_fragmented: 当日10回以上
    if count_today >= 10:
        _check_and_award(baby_id, "extreme_fragmented", user_id, db, results)

    _check_special_dates(baby_id, user_id, record.start_time, db, results)
    _check_triple_record(baby_id, user_id, record.start_time, db, results)


def _check_growth(
    baby_id: int,
    user_id: int,
    record: Growth,
    db: Session,
    results: list[dict],
) -> None:
    if record.weight is not None:
        # weight_5kg / weight_10kg
        if record.weight >= 5000:
            _check_and_award(baby_id, "weight_5kg", user_id, db, results)
        if record.weight >= 7000:
            _check_and_award(baby_id, "weight_7kg", user_id, db, results)
        if record.weight >= 10000:
            _check_and_award(baby_id, "weight_10kg", user_id, db, results)
        if record.weight >= 15000:
            _check_and_award(baby_id, "weight_15kg", user_id, db, results)

        # weight_double: 最初の体重記録の2倍
        first_growth = db.query(Growth).filter(
            Growth.baby_id == baby_id,
            Growth.weight.isnot(None),
            Growth.is_deleted == False,
        ).order_by(Growth.date.asc()).first()
        if first_growth and first_growth.weight and record.weight >= first_growth.weight * 2 and first_growth.id != record.id:
            _check_and_award(baby_id, "weight_double", user_id, db, results)

    if record.height is not None:
        if record.height >= 60.0:
            _check_and_award(baby_id, "height_60cm", user_id, db, results)
        if record.height >= 80.0:
            _check_and_award(baby_id, "height_80cm", user_id, db, results)


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

    # high_fever: 39度以上
    if record.temperature >= 39.0:
        _check_and_award(baby_id, "high_fever", user_id, db, results)

    # perfect_temp: 36.5度 ±0.05
    if abs(record.temperature - 36.5) < 0.05:
        _check_and_award(baby_id, "perfect_temp", user_id, db, results)

    # temp_10: 体温記録 10 回以上
    total_temp = db.query(func.count(TemperatureRecord.id)).filter(
        TemperatureRecord.baby_id == baby_id,
        TemperatureRecord.is_deleted == False,
    ).scalar() or 0
    if total_temp >= 10:
        _check_and_award(baby_id, "temp_10", user_id, db, results)

    _check_special_dates(baby_id, user_id, record.measured_at, db, results)


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
        (730, "second_birthday"),
    ]:
        if delta_days >= min_days:
            _check_and_award(baby_id, achievement_id, user_id, db, results)


def _check_family_participation(
    baby_id: int,
    user_id: int,
    db: Session,
    results: list[dict],
    reference_time: datetime | None = None,
) -> None:
    # ファミリー全記録からユニーク記録者数を取得（授乳ベース）
    distinct_users = db.query(func.count(func.distinct(Feeding.user_id))).filter(
        Feeding.baby_id == baby_id,
        Feeding.is_deleted == False,
    ).scalar() or 0

    # おむつも含めて重複排除
    if distinct_users < 2:
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

    # days_100/200/365: 授乳・おむつ・睡眠の記録がある日を集計
    feeding_dates = sa_select(func.date(Feeding.feeding_time).label("d")).where(
        Feeding.baby_id == baby_id,
        Feeding.is_deleted == False,
    )
    diaper_dates = sa_select(func.date(Diaper.change_time).label("d")).where(
        Diaper.baby_id == baby_id,
        Diaper.is_deleted == False,
    )
    sleep_dates = sa_select(func.date(Sleep.start_time).label("d")).where(
        Sleep.baby_id == baby_id,
        Sleep.is_deleted == False,
    )
    date_subq = union_all(feeding_dates, diaper_dates, sleep_dates).subquery()
    distinct_days = db.query(func.count(func.distinct(date_subq.c.d))).scalar() or 0

    if distinct_days >= 100:
        _check_and_award(baby_id, "days_100", user_id, db, results)
    if distinct_days >= 200:
        _check_and_award(baby_id, "days_200", user_id, db, results)
    if distinct_days >= 365:
        _check_and_award(baby_id, "days_365", user_id, db, results)

    # solo_warrior: 現在の user_id が 24h 以内に 20 回以上記録
    import datetime as _dt
    now = reference_time or datetime.now(tz=_dt.timezone.utc)
    day_ago = now - timedelta(hours=24)
    feed_count = db.query(func.count(Feeding.id)).filter(
        Feeding.baby_id == baby_id,
        Feeding.user_id == user_id,
        Feeding.feeding_time >= day_ago,
        Feeding.is_deleted == False,
    ).scalar() or 0
    diaper_count = db.query(func.count(Diaper.id)).filter(
        Diaper.baby_id == baby_id,
        Diaper.user_id == user_id,
        Diaper.change_time >= day_ago,
        Diaper.is_deleted == False,
    ).scalar() or 0
    sleep_count = db.query(func.count(Sleep.id)).filter(
        Sleep.baby_id == baby_id,
        Sleep.user_id == user_id,
        Sleep.start_time >= day_ago,
        Sleep.is_deleted == False,
    ).scalar() or 0
    temp_count = db.query(func.count(TemperatureRecord.id)).filter(
        TemperatureRecord.baby_id == baby_id,
        TemperatureRecord.user_id == user_id,
        TemperatureRecord.measured_at >= day_ago,
        TemperatureRecord.is_deleted == False,
    ).scalar() or 0
    if feed_count + diaper_count + sleep_count + temp_count >= 20:
        _check_and_award(baby_id, "solo_warrior", user_id, db, results)

    # midnight_hero: 深夜 0〜4 時に 2 人以上が記録（参照時刻のJST日付の 0〜4 時）
    ref_jst = now.astimezone(JST)
    midnight_start = ref_jst.replace(hour=0, minute=0, second=0, microsecond=0)
    midnight_start = midnight_start - timedelta(hours=9)  # JST 0:00 → UTC
    midnight_end = midnight_start + timedelta(hours=4)
    mid_feed_users = sa_select(Feeding.user_id.label("uid")).where(
        Feeding.baby_id == baby_id,
        Feeding.feeding_time >= midnight_start,
        Feeding.feeding_time < midnight_end,
        Feeding.is_deleted == False,
    )
    mid_diaper_users = sa_select(Diaper.user_id.label("uid")).where(
        Diaper.baby_id == baby_id,
        Diaper.change_time >= midnight_start,
        Diaper.change_time < midnight_end,
        Diaper.is_deleted == False,
    )
    mid_subq = union_all(mid_feed_users, mid_diaper_users).subquery()
    midnight_distinct = db.query(func.count(func.distinct(mid_subq.c.uid))).scalar() or 0
    if midnight_distinct >= 2:
        _check_and_award(baby_id, "midnight_hero", user_id, db, results)

    # all_categories: 全5種類を記録済み
    has_feeding = db.query(Feeding.id).filter(
        Feeding.baby_id == baby_id,
        Feeding.is_deleted == False,
    ).first() is not None
    has_diaper = db.query(Diaper.id).filter(
        Diaper.baby_id == baby_id,
        Diaper.is_deleted == False,
    ).first() is not None
    has_sleep = db.query(Sleep.id).filter(
        Sleep.baby_id == baby_id,
        Sleep.is_deleted == False,
    ).first() is not None
    has_growth = db.query(Growth.id).filter(
        Growth.baby_id == baby_id,
        Growth.is_deleted == False,
    ).first() is not None
    has_temp = db.query(TemperatureRecord.id).filter(
        TemperatureRecord.baby_id == baby_id,
        TemperatureRecord.is_deleted == False,
    ).first() is not None
    if has_feeding and has_diaper and has_sleep and has_growth and has_temp:
        _check_and_award(baby_id, "all_categories", user_id, db, results)

    # 連続記録日数チェック
    _check_streak(baby_id, user_id, db, results)


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
        # record の時刻を参照時刻として渡す
        ref_time = None
        if record is not None:
            for attr in ("change_time", "feeding_time", "start_time", "measured_at"):
                t = getattr(record, attr, None)
                if t is not None:
                    ref_time = t if t.tzinfo else t.replace(tzinfo=__import__("datetime").timezone.utc)
                    break
        _check_family_participation(baby_id, user_id, db, results, reference_time=ref_time)

        savepoint.commit()
    except Exception as e:
        logger.error(f"Achievement check failed for baby_id={baby_id}, type={record_type}: {e}", exc_info=True)
        savepoint.rollback()  # checkerのflushのみロールバック。呼び出し元には影響しない
        return []

    return results
