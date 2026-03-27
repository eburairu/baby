from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.relative import Relative
from app.schemas.relative import RelativeCreate, RelativeUpdate, RelativeResponse

router = APIRouter(prefix="/api/babies", tags=["relatives"])


def _build_response(record: Relative, user_map: dict) -> RelativeResponse:
    r = RelativeResponse.model_validate(record)
    r.user_display_name = user_map.get(record.user_id) if record.user_id else None
    return r


@router.get("/{baby_id}/relatives", response_model=List[RelativeResponse])
def get_relatives(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_baby_access(db, baby_id, current_user.id, record_type="baby")
    records = (
        db.query(Relative)
        .filter(Relative.baby_id == baby_id, Relative.is_deleted == False)  # noqa: E712
        .order_by(Relative.id.asc())
        .all()
    )
    user_ids = {r.user_id for r in records if r.user_id is not None}
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u.display_name or u.username for u in users}
    return [_build_response(r, user_map) for r in records]


@router.post("/{baby_id}/relatives", response_model=RelativeResponse)
def create_relative(
    baby_id: int,
    relative_in: RelativeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_baby_access(db, baby_id, current_user.id, record_type="baby", require_write=True)

    if relative_in.user_id is not None:
        user = db.query(User).filter(User.id == relative_in.user_id, User.is_deleted == False).first()  # noqa: E712
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

    record = Relative(
        baby_id=baby_id,
        name=relative_in.name,
        relationship_type=relative_in.relationship_type,
        user_id=relative_in.user_id,
        notes=relative_in.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    user_map = {}
    if record.user_id is not None:
        user = db.query(User).filter(User.id == record.user_id).first()
        if user:
            user_map[user.id] = user.display_name or user.username
    return _build_response(record, user_map)


@router.patch("/{baby_id}/relatives/{relative_id}", response_model=RelativeResponse)
def update_relative(
    baby_id: int,
    relative_id: int,
    relative_in: RelativeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_baby_access(db, baby_id, current_user.id, record_type="baby", require_write=True)

    record = db.query(Relative).filter(
        Relative.id == relative_id,
        Relative.baby_id == baby_id,
        Relative.is_deleted == False,  # noqa: E712
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Relative not found")

    if relative_in.name is not None:
        record.name = relative_in.name
    if relative_in.relationship_type is not None:
        record.relationship_type = relative_in.relationship_type
    if relative_in.user_id is not None:
        user = db.query(User).filter(User.id == relative_in.user_id, User.is_deleted == False).first()  # noqa: E712
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        record.user_id = relative_in.user_id
    elif "user_id" in relative_in.model_fields_set:
        record.user_id = None
    if relative_in.notes is not None:
        record.notes = relative_in.notes

    db.commit()
    db.refresh(record)

    user_map = {}
    if record.user_id is not None:
        user = db.query(User).filter(User.id == record.user_id).first()
        if user:
            user_map[user.id] = user.display_name or user.username
    return _build_response(record, user_map)


@router.delete("/{baby_id}/relatives/{relative_id}")
def delete_relative(
    baby_id: int,
    relative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_baby_access(db, baby_id, current_user.id, record_type="baby", require_write=True)

    record = db.query(Relative).filter(
        Relative.id == relative_id,
        Relative.baby_id == baby_id,
        Relative.is_deleted == False,  # noqa: E712
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Relative not found")

    record.is_deleted = True
    db.commit()
    return {"message": "Deleted"}
