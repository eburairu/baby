from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta, timezone

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.note import Note
from app.models.comment import RecordComment
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.utils.timezone import to_jst_naive
from app.utils.notifications import notify_family_members
from app.models.baby import Baby

router = APIRouter(prefix="/api", tags=["notes"])

def _build_note_response(note: Note, user_map: dict) -> NoteResponse:
    r = NoteResponse.model_validate(note)
    r.recorded_by_display_name = user_map.get(note.user_id)
    return r

@router.get("/babies/{baby_id}/notes", response_model=List[NoteResponse])
def get_notes(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """メモ一覧取得（履歴）"""
    verify_baby_access(db, baby_id, current_user.id, record_type="note")
    records = db.query(Note).filter(Note.baby_id == baby_id).order_by(Note.note_time.desc()).all()
    user_ids = {r.user_id for r in records if r.user_id is not None}
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u.display_name or u.username for u in users}
    return [_build_note_response(r, user_map) for r in records]

@router.post("/babies/{baby_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    baby_id: int,
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """メモの新規登録"""
    verify_baby_access(db, baby_id, current_user.id, record_type="note", require_write=True)
    
    # 未来の日時は許可しない（5分のバッファを持たせる）
    check_time = note_in.note_time
    if check_time.tzinfo is None:
        now = datetime.now()
    else:
        now = datetime.now(timezone.utc)
    
    if check_time > now + timedelta(minutes=5):
         raise HTTPException(status_code=400, detail="Future date is not allowed")

    db_note = Note(
        baby_id=baby_id,
        user_id=current_user.id,
        content=note_in.content,
        note_time=to_jst_naive(note_in.note_time)
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)

    # 家族に通知
    baby = db.query(Baby).filter(Baby.id == baby_id).first()
    if baby:
        display_name = current_user.display_name or current_user.username
        notify_family_members(
            db,
            baby.family_id,
            current_user.id,
            title="メモの投稿",
            body=f"{display_name}さんが新しいメモを投稿しました。",
            url=f"/note",
            category="family_record"
        )

    response = NoteResponse.model_validate(db_note)
    response.recorded_by_display_name = current_user.display_name or current_user.username
    return response

@router.patch("/notes/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_in: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """メモの編集"""
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    verify_baby_access(db, db_note.baby_id, current_user.id, record_type="note", require_write=True)

    if note_in.note_time:
        check_time = note_in.note_time
        if check_time.tzinfo is None:
            now = datetime.now()
        else:
            now = datetime.now(timezone.utc)
            
        if check_time > now + timedelta(minutes=5):
            raise HTTPException(status_code=400, detail="Future date is not allowed")

    update_data = note_in.model_dump(exclude_unset=True)
    if "note_time" in update_data and update_data["note_time"]:
        update_data["note_time"] = to_jst_naive(update_data["note_time"])

    for field, value in update_data.items():
        setattr(db_note, field, value)

    db.commit()
    db.refresh(db_note)
    recorder = db.query(User).filter(User.id == db_note.user_id).first() if db_note.user_id else None
    response = NoteResponse.model_validate(db_note)
    response.recorded_by_display_name = (recorder.display_name or recorder.username) if recorder else None
    return response

@router.delete("/notes/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """メモの削除"""
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    verify_baby_access(db, db_note.baby_id, current_user.id, record_type="note", require_write=True)

    db.query(RecordComment).filter(
        RecordComment.record_type == "note",
        RecordComment.record_id == note_id
    ).delete()
    db.delete(db_note)
    db.commit()
    return {"message": "Deleted"}
