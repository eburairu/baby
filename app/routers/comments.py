from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.family import FamilyUser, UserRole
from app.models.comment import RecordComment
from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.contraction import Contraction
from app.models.schedule import Schedule
from app.models.note import Note
from app.schemas.comment import CommentCreate, CommentResponse

router = APIRouter(prefix="/api", tags=["comments"])


def get_record_baby_id(db: Session, record_type: str, record_id: int) -> int:
    """対象記録の実在確認と baby_id の取得"""
    model_map = {
        "feeding": Feeding,
        "sleep": Sleep,
        "diaper": Diaper,
        "growth": Growth,
        "contraction": Contraction,
        "schedule": Schedule,
        "note": Note,
    }
    model = model_map.get(record_type)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid record type: {record_type}")
    
    record = db.query(model).filter(model.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Record not found: {record_type} {record_id}")
    
    return record.baby_id


@router.get("/records/{record_type}/{record_id}/comments", response_model=List[CommentResponse])
def get_record_comments(
    record_type: str,
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    baby_id = get_record_baby_id(db, record_type, record_id)
    verify_baby_access(db, baby_id, current_user.id, record_type=record_type)

    comments = db.query(RecordComment).filter(
        RecordComment.record_type == record_type,
        RecordComment.record_id == record_id
    ).order_by(RecordComment.created_at.asc()).all()

    # Get roles for each commenter
    results = []
    for c in comments:
        family_user = db.query(FamilyUser).filter(FamilyUser.user_id == c.user_id).first()
        results.append(CommentResponse(
            id=c.id,
            user_id=c.user_id,
            user_display_name=c.user.display_name or c.user.username,
            user_role=family_user.role if family_user else "unknown",
            content=c.content,
            created_at=c.created_at
        ))
    return results


@router.post("/records/{record_type}/{record_id}/comments", response_model=CommentResponse)
def create_record_comment(
    record_type: str,
    record_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    baby_id = get_record_baby_id(db, record_type, record_id)
    # viewer も投稿可能とするため require_write=False
    verify_baby_access(db, baby_id, current_user.id, record_type=record_type)

    new_comment = RecordComment(
        baby_id=baby_id,
        user_id=current_user.id,
        record_type=record_type,
        record_id=record_id,
        content=comment_in.content
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    return CommentResponse(
        id=new_comment.id,
        user_id=new_comment.user_id,
        user_display_name=current_user.display_name or current_user.username,
        user_role=family_user.role if family_user else "unknown",
        content=new_comment.content,
        created_at=new_comment.created_at
    )


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(RecordComment).filter(RecordComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    if comment.user_id != current_user.id and family_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()
