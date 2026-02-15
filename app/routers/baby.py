from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.family import FamilyUser, UserRole
from app.models.baby import Baby, BabyPermission
from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.contraction import Contraction
from app.models.schedule import Schedule
from app.models.note import Note
from app.schemas.baby import BabyCreate, BabyUpdate, BabyResponse

router = APIRouter(prefix="/api/babies", tags=["babies"])


class UnifiedRecord(BaseModel):
    id: int
    type: str
    timestamp: datetime
    details: dict

    class Config:
        from_attributes = True


class RecordCreate(BaseModel):
    type: str
    timestamp: datetime


@router.get("/", response_model=List[BabyResponse])
def get_babies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        return []

    babies = db.query(Baby).filter(Baby.family_id == family_user.family_id).all()

    # admin は全件返す
    if family_user.role == UserRole.ADMIN:
        return babies

    # member: BabyPermission で can_view=false の赤ちゃんを除外
    hidden_baby_ids = set(
        perm.baby_id for perm in db.query(BabyPermission).filter(
            BabyPermission.user_id == current_user.id,
            BabyPermission.record_type == "baby",
            BabyPermission.can_view == False,
        ).all()
    )
    return [b for b in babies if b.id not in hidden_baby_ids]


@router.post("/", response_model=BabyResponse)
def create_baby(baby_in: BabyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")
    if family_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can add babies")

    new_baby = Baby(
        family_id=family_user.family_id,
        name=baby_in.name,
        birthday=baby_in.birthday,
        due_date=baby_in.due_date,
        gender=baby_in.gender,
        characteristics=baby_in.characteristics,
    )
    db.add(new_baby)
    db.commit()
    db.refresh(new_baby)
    return new_baby


@router.patch("/{baby_id}", response_model=BabyResponse)
def update_baby(baby_id: int, baby_in: BabyUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")
    if family_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can edit babies")

    baby = db.query(Baby).filter(Baby.id == baby_id, Baby.family_id == family_user.family_id).first()
    if not baby:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Baby not found")

    from app.services.baby import update_baby as update_baby_service
    
    updated_baby = update_baby_service(db, baby, baby_in)
    return updated_baby


@router.delete("/{baby_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_baby(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if not family_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in a family")
    if family_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can delete babies")

    baby = db.query(Baby).filter(Baby.id == baby_id, Baby.family_id == family_user.family_id).first()
    if not baby:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Baby not found")

    db.query(Feeding).filter(Feeding.baby_id == baby_id).delete()
    db.query(Sleep).filter(Sleep.baby_id == baby_id).delete()
    db.query(Diaper).filter(Diaper.baby_id == baby_id).delete()
    db.query(Growth).filter(Growth.baby_id == baby_id).delete()
    db.query(Contraction).filter(Contraction.baby_id == baby_id).delete()
    db.query(Schedule).filter(Schedule.baby_id == baby_id).delete()
    db.query(Note).filter(Note.baby_id == baby_id).delete()
    db.delete(baby)
    db.commit()


@router.get("/{baby_id}/records", response_model=List[UnifiedRecord])
def get_records(baby_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # "baby" レベルのアクセスチェック（record_type="baby" はデフォルトなので変更不要）
    verify_baby_access(db, baby_id, current_user.id)

    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    is_admin = family_user and family_user.role == UserRole.ADMIN

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
        # If permission record exists, use its value. Otherwise default to True.
        return permissions.get(rt, True)

    records: List[UnifiedRecord] = []

    if can_view_type("feeding"):
        for feeding in db.query(Feeding).filter(Feeding.baby_id == baby_id).all():
            records.append(UnifiedRecord(
                id=feeding.id,
                type="feeding",
                timestamp=feeding.feeding_time,
                details={
                    "feeding_type": feeding.feeding_type,
                    "amount_ml": feeding.amount_ml,
                    "duration_minutes": feeding.duration_minutes,
                    "notes": feeding.notes,
                },
            ))

    if can_view_type("sleep"):
        for sleep in db.query(Sleep).filter(Sleep.baby_id == baby_id).all():
            records.append(UnifiedRecord(
                id=sleep.id,
                type="sleep",
                timestamp=sleep.start_time,
                details={
                    "end_time": sleep.end_time.isoformat() if sleep.end_time else None,
                    "notes": sleep.notes,
                },
            ))

    if can_view_type("diaper"):
        for diaper in db.query(Diaper).filter(Diaper.baby_id == baby_id).all():
            records.append(UnifiedRecord(
                id=diaper.id,
                type="diaper",
                timestamp=diaper.change_time,
                details={
                    "diaper_type": diaper.diaper_type,
                    "notes": diaper.notes,
                },
            ))

    if can_view_type("growth"):
        for growth in db.query(Growth).filter(Growth.baby_id == baby_id).all():
            records.append(UnifiedRecord(
                id=growth.id,
                type="growth",
                timestamp=datetime.combine(growth.date, datetime.min.time()),
                details={
                    "weight_kg": growth.weight / 1000.0 if growth.weight else None,
                    "height_cm": growth.height,
                    "head_circumference_cm": growth.head_circumference,
                    "notes": growth.notes,
                },
            ))

    if can_view_type("note"):
        for note in db.query(Note).filter(Note.baby_id == baby_id).all():
            records.append(UnifiedRecord(
                id=note.id,
                type="note",
                timestamp=note.note_time,
                details={
                    "notes": note.content,
                },
            ))

    records.sort(key=lambda r: r.timestamp, reverse=True)
    return records


@router.post("/{baby_id}/records", response_model=UnifiedRecord)
def create_record(baby_id: int, record_in: RecordCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record_type = record_in.type
    verify_baby_access(db, baby_id, current_user.id, record_type=record_type, require_write=True)

    timestamp = record_in.timestamp

    if record_type == "feeding":
        from app.models.feeding import FeedingType
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
        from app.models.diaper import DiaperType
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
