from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter(prefix="/api", tags=["notes"])

@router.get("/babies/{baby_id}/notes", response_model=List[NoteResponse])
def get_notes(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """メモ一覧取得（履歴）"""
    verify_baby_access(db, baby_id, current_user.id, record_type="note")
    return db.query(Note).filter(Note.baby_id == baby_id).order_by(Note.note_time.desc()).all()

@router.post("/babies/{baby_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    baby_id: int,
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """メモの新規登録"""
    verify_baby_access(db, baby_id, current_user.id, record_type="note")
    
    # 未来の日時は許可しない
    if note_in.note_time > datetime.now():
         raise HTTPException(status_code=400, detail="Future date is not allowed")

    db_note = Note(
        baby_id=baby_id,
        user_id=current_user.id,
        content=note_in.content,
        note_time=note_in.note_time
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

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
    
    verify_baby_access(db, db_note.baby_id, current_user.id, record_type="note")

    if note_in.note_time and note_in.note_time > datetime.now():
         raise HTTPException(status_code=400, detail="Future date is not allowed")

    update_data = note_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_note, field, value)

    db.commit()
    db.refresh(db_note)
    return db_note

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
    
    verify_baby_access(db, db_note.baby_id, current_user.id, record_type="note")

    db.delete(db_note)
    db.commit()
    return {"message": "Deleted"}
