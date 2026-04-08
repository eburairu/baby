from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.family import FamilyUser
from app.models.enums import UserRole
from app.models.comment import RecordComment
from app.models.feeding import Feeding
from app.models.sleep import Sleep
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.contraction import Contraction
from app.models.schedule import Schedule
from app.models.note import Note
from app.models.temperature import TemperatureRecord
from app.schemas.comment import CommentCreate, CommentResponse
from app.utils.notifications import notify_family_members
from app.models.baby import Baby
from app.utils.rate_limit import RateLimiter
from app.core import constants

router = APIRouter(prefix="/api", tags=["comments"])

# Rate limit for comments: 10 comments per minute per user
comment_limiter = RateLimiter(
    requests_limit=constants.RATE_LIMIT_COMMENT_REQUESTS,
    time_window=constants.RATE_LIMIT_COMMENT_WINDOW,
    error_message="Too many comments. Please wait a moment.",
)


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
        "temperature": TemperatureRecord,
    }
    model = model_map.get(record_type)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid record type: {record_type}")
    
    record = db.query(model).filter(model.id == record_id, model.is_deleted == False).first()
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

    # ⚡ Bolt: Fetch comments with eager loading for user to avoid N+1 queries.
    comments = db.query(RecordComment).options(
        joinedload(RecordComment.user)
    ).filter(
        RecordComment.record_type == record_type,
        RecordComment.record_id == record_id,
        RecordComment.is_deleted == False
    ).order_by(RecordComment.created_at.asc()).all()

    # ⚡ Bolt: Fetch-then-batch strategy for FamilyUser roles to eliminate N+1 queries.
    user_ids = list({c.user_id for c in comments if not c.is_ai_generated and c.user_id is not None})
    user_roles = {}
    if user_ids:
        family_users = db.query(FamilyUser.user_id, FamilyUser.role).filter(FamilyUser.user_id.in_(user_ids)).all()
        user_roles = {fu.user_id: fu.role for fu in family_users}

    # Get roles for each commenter
    results = []
    for c in comments:
        if c.is_ai_generated:
            results.append(CommentResponse(
                id=c.id,
                user_id=None,
                user_display_name="AIフィードバック",
                user_role="ai",
                content=c.content,
                created_at=c.created_at,
                is_ai_generated=True,
                ai_has_concern=c.ai_has_concern,
            ))
        else:
            role = user_roles.get(c.user_id, "unknown")
            results.append(CommentResponse(
                id=c.id,
                user_id=c.user_id,
                user_display_name=c.user.display_name or c.user.username if c.user else None,
                user_role=role,
                content=c.content,
                created_at=c.created_at,
                is_ai_generated=False,
                ai_has_concern=None,
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
    # Check rate limit
    comment_limiter.check(f"user_{current_user.id}")

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

    # 家族に通知
    baby = db.query(Baby).filter(Baby.id == baby_id).first()
    if baby:
        display_name = current_user.display_name or current_user.username
        notify_family_members(
            db,
            baby.family_id,
            current_user.id,
            title="新しいコメント",
            body=f"{display_name}さんが記録にコメントしました。",
            url=f"/{record_type}?comment={record_id}&baby_id={baby_id}",
            category="comment",
        )

    family_user = db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()
    return CommentResponse(
        id=new_comment.id,
        user_id=new_comment.user_id,
        user_display_name=current_user.display_name or current_user.username,
        user_role=family_user.role if family_user else "unknown",
        content=new_comment.content,
        created_at=new_comment.created_at,
        is_ai_generated=False,
        ai_has_concern=None,
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

    # コメントに紐づく baby へのアクセス権を検証（ファミリー間の分離を保証）
    baby = verify_baby_access(db, comment.baby_id, current_user.id)

    family_user = db.query(FamilyUser).filter(
        FamilyUser.user_id == current_user.id,
        FamilyUser.family_id == baby.family_id
    ).first()
    if comment.user_id != current_user.id and (family_user is None or family_user.role != UserRole.ADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this comment")

    comment.is_deleted = True
    db.commit()
