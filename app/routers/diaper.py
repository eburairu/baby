from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.diaper import Diaper
from app.models.comment import RecordComment
from app.schemas.diaper import DiaperCreate, DiaperResponse, DiaperUpdate
from app.utils.timezone import to_jst_naive
from app.utils.notifications import notify_family_members
from app.models.baby import Baby

router = APIRouter(prefix="/api/diapers", tags=["diapers"])


@router.get("/", response_model=List[DiaperResponse])
def get_diapers(
    baby_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_baby_access(db, baby_id, current_user.id, record_type="diaper")
    return db.query(Diaper).filter(Diaper.baby_id == baby_id).order_by(Diaper.change_time.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=DiaperResponse)
def create_diaper(diaper_in: DiaperCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_baby_access(db, diaper_in.baby_id, current_user.id, record_type="diaper", require_write=True)
    new_diaper = Diaper(
        user_id=current_user.id,
        baby_id=diaper_in.baby_id,
        change_time=to_jst_naive(diaper_in.change_time),
        diaper_type=diaper_in.diaper_type,
        notes=diaper_in.notes,
    )
    db.add(new_diaper)
    db.commit()
    db.refresh(new_diaper)
    
    # 家族に通知
    baby = db.query(Baby).filter(Baby.id == new_diaper.baby_id).first()
    if baby:
        display_name = current_user.display_name or current_user.username
        notify_family_members(
            db, 
            baby.family_id, 
            current_user.id, 
            title="オムツの記録", 
            body=f"{display_name}さんが{baby.name}のオムツを替えました。",
            url=f"/diaper",
            category="family_record"
        )
        
    return new_diaper


@router.delete("/{diaper_id}")
def delete_diaper(diaper_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    diaper = db.query(Diaper).filter(Diaper.id == diaper_id).first()
    if not diaper:
        raise HTTPException(status_code=404, detail="Diaper record not found")
    verify_baby_access(db, diaper.baby_id, current_user.id, record_type="diaper", require_write=True)
    db.query(RecordComment).filter(
        RecordComment.record_type == "diaper",
        RecordComment.record_id == diaper_id
    ).delete()
    db.delete(diaper)
    db.commit()
    return {"message": "Deleted"}


@router.put("/{diaper_id}", response_model=DiaperResponse)
def update_diaper(diaper_id: int, diaper_in: DiaperUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    diaper = db.query(Diaper).filter(Diaper.id == diaper_id).first()
    if not diaper:
        raise HTTPException(status_code=404, detail="Diaper record not found")
    verify_baby_access(db, diaper.baby_id, current_user.id, record_type="diaper", require_write=True)

    if diaper_in.change_time:
        diaper.change_time = to_jst_naive(diaper_in.change_time)
    if diaper_in.diaper_type:
        diaper.diaper_type = diaper_in.diaper_type
    if diaper_in.notes is not None:
        diaper.notes = diaper_in.notes

    db.commit()
    db.refresh(diaper)
    return diaper
