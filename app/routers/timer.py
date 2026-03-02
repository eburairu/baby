from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.models.timer import ContractionTimerState, FeedingTimerState
from app.schemas.timer import (
    ContractionTimerResponse, ContractionTimerUpdate,
    FeedingTimerResponse, FeedingTimerUpdate,
)

router = APIRouter(prefix="/api/babies", tags=["timer"])


# --- 陣痛タイマー ---

@router.get("/{baby_id}/timer/contraction", response_model=ContractionTimerResponse)
def get_contraction_timer(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_baby_access(db, baby_id, current_user.id, record_type="baby")
    state = db.query(ContractionTimerState).filter(
        ContractionTimerState.baby_id == baby_id
    ).first()
    if state is None:
        return ContractionTimerResponse(status="idle", start_time=None)
    return state


@router.put("/{baby_id}/timer/contraction", response_model=ContractionTimerResponse)
def put_contraction_timer(
    baby_id: int,
    body: ContractionTimerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_baby_access(db, baby_id, current_user.id, record_type="baby", require_write=True)
    state = db.query(ContractionTimerState).filter(
        ContractionTimerState.baby_id == baby_id
    ).first()
    if state is None:
        state = ContractionTimerState(baby_id=baby_id)
        db.add(state)
    state.status = body.status
    state.start_time = body.start_time
    db.commit()
    db.refresh(state)
    return state


# --- 授乳タイマー ---

@router.get("/{baby_id}/timer/feeding", response_model=FeedingTimerResponse)
def get_feeding_timer(
    baby_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_baby_access(db, baby_id, current_user.id, record_type="baby")
    state = db.query(FeedingTimerState).filter(
        FeedingTimerState.baby_id == baby_id
    ).first()
    if state is None:
        return FeedingTimerResponse(
            active_side=None,
            left_elapsed_seconds=0,
            right_elapsed_seconds=0,
            segment_start_time=None,
        )
    return state


@router.put("/{baby_id}/timer/feeding", response_model=FeedingTimerResponse)
def put_feeding_timer(
    baby_id: int,
    body: FeedingTimerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verify_baby_access(db, baby_id, current_user.id, record_type="baby", require_write=True)
    state = db.query(FeedingTimerState).filter(
        FeedingTimerState.baby_id == baby_id
    ).first()
    if state is None:
        state = FeedingTimerState(baby_id=baby_id)
        db.add(state)
    state.active_side = body.active_side
    state.left_elapsed_seconds = body.left_elapsed_seconds
    state.right_elapsed_seconds = body.right_elapsed_seconds
    state.segment_start_time = body.segment_start_time
    db.commit()
    db.refresh(state)
    return state
