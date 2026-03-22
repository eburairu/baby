from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from collections import defaultdict
from sqlalchemy import func, or_, and_
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional
import logging

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.family import FamilyUser
from app.models.enums import UserRole
from app.models.baby import Baby, BabyPermission
from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.contraction import Contraction
from app.models.schedule import Schedule
from app.models.note import Note
from app.models.comment import RecordComment
from app.schemas.baby import BabyCreate, BabyUpdate, BabyResponse
from app.utils.timezone import JST
from app.core.constants import DEFAULT_PAGINATION_LIMIT, MAX_PAGINATION_LIMIT

router = APIRouter(prefix="/api/babies", tags=["babies"])

logger = logging.getLogger(__name__)


class UnifiedRecord(BaseModel):
    id: int
    type: str
    timestamp: datetime
    details: dict
    comment_count: int = 0
    has_ai_feedback: bool = False
    has_ai_concern: bool = False
    recorded_by_display_name: Optional[str] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class RecordCreate(BaseModel):
    type: str
    timestamp: datetime


@router.get("/", response_model=List[BabyResponse])
def get_babies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: Optional[int] = Query(None, description="Maximum number of items to return (SuperAdmin only)", ge=1, le=1000),
    offset: Optional[int] = Query(None, description="Number of items to skip (SuperAdmin only)", ge=0)
):
    if current_user.is_superadmin:
        query = db.query(Baby).filter(Baby.is_deleted == False)
        if limit is not None:
            query = query.limit(limit)
        if offset is not None:
            query = query.offset(offset)
        return query.all()

    family_users = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).all()
    if not family_users:
        return []

    family_ids = [fu.family_id for fu in family_users]
    babies = db.query(Baby).filter(
        Baby.family_id.in_(family_ids),
        Baby.is_deleted == False
    ).all()

    family_roles = {fu.family_id: fu.role for fu in family_users}

    # member/viewer: can_view=true の BabyPermission が存在する赤ちゃんのみ返す（デフォルト拒否）
    allowed_baby_ids = set(
        perm.baby_id for perm in db.query(BabyPermission).filter(
            BabyPermission.user_id == current_user.id,
            BabyPermission.record_type == "baby",
            BabyPermission.can_view == True,
        ).all()
    )
    
    result = []
    for b in babies:
        if family_roles.get(b.family_id) == UserRole.ADMIN or b.id in allowed_baby_ids:
            result.append(b)
            
    return result


@router.post("/", response_model=BabyResponse)
def create_baby(baby_in: BabyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")
    if family_user.role != UserRole.ADMIN and not current_user.is_superadmin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can add babies")

    new_baby = Baby(
        family_id=family_user.family_id,
        name=baby_in.name,
        birthday=baby_in.birthday,
        due_date=baby_in.due_date,
        gender=baby_in.gender,
        characteristics=baby_in.characteristics,
        feeding_threshold_minutes=baby_in.feeding_threshold_minutes,
        diaper_threshold_minutes=baby_in.diaper_threshold_minutes,
    )
    db.add(new_baby)
    db.commit()
    db.refresh(new_baby)
    logger.info("Baby created: baby_id=%s, family_id=%s, by user_id=%s", new_baby.id, new_baby.family_id, current_user.id)
    return new_baby


@router.patch("/{baby_id}", response_model=BabyResponse)
def update_baby(baby_id: int, baby_in: BabyUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    is_superadmin = current_user.is_superadmin
    family_user = None

    if not is_superadmin:
        family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
        if not family_user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")
        if family_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can edit babies")

    baby_query = db.query(Baby).filter(Baby.id == baby_id, Baby.is_deleted == False)
    if not is_superadmin:
        baby_query = baby_query.filter(Baby.family_id == family_user.family_id)
    
    baby = baby_query.first()
    if not baby:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Baby not found")

    from app.services.baby import update_baby as update_baby_service
    
    updated_baby = update_baby_service(db, baby, baby_in)
    logger.info("Baby updated: baby_id=%s, by user_id=%s", updated_baby.id, current_user.id)
    return updated_baby


@router.delete("/{baby_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_baby(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    is_superadmin = current_user.is_superadmin
    family_user = None

    if not is_superadmin:
        family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
        if not family_user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")
        if family_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can delete babies")

    baby_query = db.query(Baby).filter(Baby.id == baby_id, Baby.is_deleted == False)
    if not is_superadmin:
        baby_query = baby_query.filter(Baby.family_id == family_user.family_id)

    baby = baby_query.first()
    if not baby:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Baby not found")

    from app.services.baby import soft_delete_baby

    deleted_baby_id = baby.id
    deleted_baby_family_id = baby.family_id

    soft_delete_baby(db, baby)
    db.commit()

    logger.info("Baby deleted: baby_id=%s, family_id=%s, by user_id=%s", deleted_baby_id, deleted_baby_family_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{baby_id}/records", response_model=List[UnifiedRecord])
def get_records(
    baby_id: int,
    limit: int = Query(DEFAULT_PAGINATION_LIMIT, ge=1, le=MAX_PAGINATION_LIMIT),
    date: Optional[str] = Query(None, description="YYYY-MM-DD形式の日付フィルタ"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # "baby" レベルのアクセスチェック（record_type="baby" はデフォルトなので変更不要）
    verify_baby_access(db, baby_id, current_user.id)

    # date パラメータが指定された場合は当日の UTC 範囲に変換（JST 基準）
    date_start: Optional[datetime] = None
    date_end: Optional[datetime] = None
    if date:
        from datetime import date as date_type, timedelta
        parsed = date_type.fromisoformat(date)
        date_start = datetime.combine(parsed, datetime.min.time()).replace(tzinfo=JST)
        date_end = date_start + timedelta(days=1)

    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    is_admin = (family_user and family_user.role == UserRole.ADMIN) or current_user.is_superadmin

    # Pre-fetch permissions ONLY if not admin
    permissions = {}
    if not is_admin:
        permissions = {
            perm.record_type: perm.can_view
            for perm in db.query(BabyPermission).filter(
                BabyPermission.baby_id == baby_id,
                BabyPermission.user_id == current_user.id
            ).all()
        }

    def can_view_type(rt: str) -> bool:
        if is_admin:
            return True
        # If permission record exists, use its value. Otherwise default to False (default deny).
        return permissions.get(rt, False)

    # 各記録と紐付く user_id を収集するためのリスト（後でまとめてUser取得）
    # (id, type, user_id, timestamp, details, comment_count_placeholder)
    raw_records: list[tuple] = []

    if can_view_type("feeding"):
        # Select only necessary columns to avoid overhead of full ORM object creation
        feeding_q = db.query(
            Feeding.id, Feeding.user_id, Feeding.feeding_time,
            Feeding.feeding_type, Feeding.amount_ml, Feeding.duration_minutes, Feeding.notes
        ).filter(
            Feeding.baby_id == baby_id,
            Feeding.is_deleted == False
        )
        if date_start:
            feeding_q = feeding_q.filter(Feeding.feeding_time >= date_start, Feeding.feeding_time < date_end)
        for feeding in feeding_q.order_by(Feeding.feeding_time.desc()).limit(MAX_PAGINATION_LIMIT).all():
            raw_records.append((
                feeding.id, "feeding", feeding.user_id, feeding.feeding_time,
                {
                    "feeding_type": feeding.feeding_type,
                    "amount_ml": feeding.amount_ml,
                    "duration_minutes": feeding.duration_minutes,
                    "notes": feeding.notes,
                },
                0,
                None
            ))

    if can_view_type("sleep"):
        sleep_q = db.query(
            Sleep.id, Sleep.user_id, Sleep.start_time, Sleep.end_time, Sleep.notes
        ).filter(
            Sleep.baby_id == baby_id,
            Sleep.is_deleted == False
        )
        if date_start:
            sleep_q = sleep_q.filter(Sleep.start_time >= date_start, Sleep.start_time < date_end)
        for sleep in sleep_q.order_by(Sleep.start_time.desc()).limit(MAX_PAGINATION_LIMIT).all():
            raw_records.append((
                sleep.id, "sleep", sleep.user_id, sleep.start_time,
                {
                    "end_time": sleep.end_time.isoformat() if sleep.end_time else None,
                    "notes": sleep.notes,
                },
                0,
                None
            ))

    if can_view_type("diaper"):
        diaper_q = db.query(
            Diaper.id, Diaper.user_id, Diaper.change_time, Diaper.diaper_type, Diaper.notes
        ).filter(
            Diaper.baby_id == baby_id,
            Diaper.is_deleted == False
        )
        if date_start:
            diaper_q = diaper_q.filter(Diaper.change_time >= date_start, Diaper.change_time < date_end)
        for diaper in diaper_q.order_by(Diaper.change_time.desc()).limit(MAX_PAGINATION_LIMIT).all():
            raw_records.append((
                diaper.id, "diaper", diaper.user_id, diaper.change_time,
                {
                    "diaper_type": diaper.diaper_type,
                    "notes": diaper.notes,
                },
                0,
                None
            ))

    if can_view_type("growth"):
        growth_q = db.query(
            Growth.id, Growth.user_id, Growth.date,
            Growth.weight, Growth.height, Growth.head_circumference, Growth.notes
        ).filter(
            Growth.baby_id == baby_id,
            Growth.is_deleted == False
        )
        if date_start and date_end:
            growth_q = growth_q.filter(Growth.date >= date_start.date(), Growth.date < date_end.date())
        for growth in growth_q.order_by(Growth.date.desc()).limit(MAX_PAGINATION_LIMIT).all():
            raw_records.append((
                growth.id, "growth", growth.user_id,
                datetime.combine(growth.date, datetime.min.time()),
                {
                    "weight_kg": growth.weight / 1000.0 if growth.weight else None,
                    "height_cm": growth.height,
                    "head_circumference_cm": growth.head_circumference,
                    "notes": growth.notes,
                },
                0,
                None
            ))

    if can_view_type("note"):
        note_q = db.query(
            Note.id, Note.user_id, Note.note_time, Note.content, Note.updated_at
        ).filter(
            Note.baby_id == baby_id,
            Note.is_deleted == False
        )
        if date_start:
            note_q = note_q.filter(Note.note_time >= date_start, Note.note_time < date_end)
        for note in note_q.order_by(Note.note_time.desc()).limit(MAX_PAGINATION_LIMIT).all():
            raw_records.append((
                note.id, "note", note.user_id, note.note_time,
                {
                    "notes": note.content,
                },
                0,
                note.updated_at
            ))

    if can_view_type("contraction"):
        contraction_q = db.query(
            Contraction.id, Contraction.user_id, Contraction.start_time,
            Contraction.end_time, Contraction.duration_seconds, Contraction.notes
        ).filter(
            Contraction.baby_id == baby_id,
            Contraction.is_deleted == False
        )
        if date_start:
            contraction_q = contraction_q.filter(Contraction.start_time >= date_start, Contraction.start_time < date_end)
        for c in contraction_q.order_by(Contraction.start_time.desc()).limit(MAX_PAGINATION_LIMIT).all():
            raw_records.append((
                c.id, "contraction", c.user_id, c.start_time,
                {
                    "end_time": c.end_time.isoformat() if c.end_time else None,
                    "duration_seconds": c.duration_seconds,
                    "notes": c.notes,
                },
                0,
                None
            ))

    # ⚡ Bolt: Fetch, Sort, Truncate, THEN Enrich
    # メモリ上でソートし、要求されたlimitまで先に切り詰めることで、以降のコメントカウント取得やUser取得のクエリ発行対象を数千件から数十件（limit数）に削減する

    # 全ての記録のタイムゾーンを比較可能なように統一（JSTとして明示）
    processed_raw_records = []
    for r in raw_records:
        ts = r[3]
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=JST)
        processed_raw_records.append((r[0], r[1], r[2], ts, r[4], r[5], r[6]))

    # タイムスタンプ降順でソートし、limitで切り詰める
    processed_raw_records.sort(key=lambda r: r[3], reverse=True)
    truncated_records = processed_raw_records[:limit]

    # Fetch comment counts ONLY for the truncated records
    comment_counts = {}
    ai_feedback_set: set[tuple[str, int]] = set()
    ai_concern_set: set[tuple[str, int]] = set()
    record_ids_by_type = defaultdict(list)
    for r in truncated_records:
        rec_id, rec_type = r[0], r[1]
        record_ids_by_type[rec_type].append(rec_id)

    if record_ids_by_type:
        conditions = []
        for r_type, r_ids in record_ids_by_type.items():
            conditions.append(
                and_(RecordComment.record_type == r_type, RecordComment.record_id.in_(r_ids))
            )

        if conditions:
            try:
                counts = db.query(
                    RecordComment.record_type,
                    RecordComment.record_id,
                    func.count(RecordComment.id)
                ).filter(
                    RecordComment.baby_id == baby_id,
                    or_(*conditions)
                ).group_by(
                    RecordComment.record_type,
                    RecordComment.record_id
                ).all()

                for rt, rid, count in counts:
                    comment_counts[(rt, rid)] = count

                            # AIフィードバック・AI警告フラグ: AIコメントが存在する記録を取得
                ai_rows = db.query(
                    RecordComment.record_type,
                    RecordComment.record_id,
                    RecordComment.ai_has_concern,
                ).filter(
                    RecordComment.baby_id == baby_id,
                    RecordComment.is_ai_generated == True,
                    RecordComment.is_deleted == False,
                    or_(*conditions)
                ).all()

                for rt, rid, concern in ai_rows:
                    ai_feedback_set.add((rt, rid))
                    if concern:
                        ai_concern_set.add((rt, rid))
            except Exception as e:
                logger.warning("Failed to fetch comment counts for baby %s: %s", baby_id, e)

    # User を一括取得してマップを作成（truncatedされたレコード群のみ）
    user_ids = {r[2] for r in truncated_records if r[2] is not None}
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u.display_name or u.username for u in users}

    records: List[UnifiedRecord] = [
        UnifiedRecord(
            id=rec_id,
            type=rec_type,
            timestamp=ts,
            details=details,
            comment_count=comment_counts.get((rec_type, rec_id), 0),
            has_ai_feedback=(rec_type, rec_id) in ai_feedback_set,
            has_ai_concern=(rec_type, rec_id) in ai_concern_set,
            recorded_by_display_name=user_map.get(user_id),
            updated_at=updated_at,
        )
        for rec_id, rec_type, user_id, ts, details, _, updated_at in truncated_records
    ]

    return records


@router.post("/{baby_id}/records", response_model=UnifiedRecord)
def create_record(baby_id: int, record_in: RecordCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record_type = record_in.type
    verify_baby_access(db, baby_id, current_user.id, record_type=record_type, require_write=True)

    timestamp = record_in.timestamp

    if record_type == "feeding":
        from app.models.enums import FeedingType
        new_record = Feeding(
            user_id=current_user.id,
            baby_id=baby_id,
            feeding_time=timestamp,
            feeding_type=FeedingType.BOTTLE,
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return UnifiedRecord(
            id=new_record.id,
            type="feeding",
            timestamp=new_record.feeding_time,
            details={"feeding_type": new_record.feeding_type, "amount_ml": None, "duration_minutes": None, "notes": None},
        )

    elif record_type == "sleep":
        new_record = Sleep(
            user_id=current_user.id,
            baby_id=baby_id,
            start_time=timestamp,
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return UnifiedRecord(
            id=new_record.id,
            type="sleep",
            timestamp=new_record.start_time,
            details={"end_time": None, "notes": None},
        )

    elif record_type == "diaper":
        from app.models.enums import DiaperType
        new_record = Diaper(
            user_id=current_user.id,
            baby_id=baby_id,
            change_time=timestamp,
            diaper_type=DiaperType.WET,
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return UnifiedRecord(
            id=new_record.id,
            type="diaper",
            timestamp=new_record.change_time,
            details={"diaper_type": new_record.diaper_type, "notes": None},
        )

    elif record_type == "growth":
        new_record = Growth(
            user_id=current_user.id,
            baby_id=baby_id,
            date=timestamp.date(),
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return UnifiedRecord(
            id=new_record.id,
            type="growth",
            timestamp=datetime.combine(new_record.date, datetime.min.time()),
            details={"weight_kg": None, "height_cm": None, "head_circumference_cm": None, "notes": None},
        )

    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown record type: {record_type}")
