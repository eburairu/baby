from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.core.exceptions import AIGenerationError, AIRateLimitError, AIServiceError, InvalidRecordTypeError, RecordNotFoundError
from app.schemas.ai_feedback import RecordFeedbackRequest, RecordFeedbackResponse
from app.services.ai_feedback import (
    generate_record_feedback,
    save_ai_comment,
)
from app.services.record import verify_record_ownership
from app.utils.rate_limit import RateLimiter
from app.utils.timezone import get_jst_now
from app.core import constants

record_feedback_limiter = RateLimiter(
    requests_limit=constants.RATE_LIMIT_AI_FEEDBACK_REQUESTS,
    time_window=constants.RATE_LIMIT_AI_FEEDBACK_WINDOW,
    error_message="Too many AI feedback requests. Please try again later.",
)

router = APIRouter(prefix="/api/babies/{baby_id}/record-feedback", tags=["ai-feedback"])


@router.post("", response_model=RecordFeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_record_feedback(
    baby_id: int,
    body: RecordFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """直近24時間の記録をAIが分析し、コメントとして保存する"""
    # AIエンドポイントへのDoS攻撃や、OpenAI APIの課金コスト枯渇を防ぐためのレー ト制限
    record_feedback_limiter.check(f"user_{current_user.id}")

    baby = verify_baby_access(db, baby_id, current_user.id, require_write=False)

    # record_id が baby_id に属するか確認
    try:
        verify_record_ownership(db, body.record_type, body.record_id, baby_id)
    except InvalidRecordTypeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RecordNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    try:
        feedback_text, has_concern, model_name = await generate_record_feedback(
            db, baby_id, baby, body.record_type, body.record_id
        )
    except AIRateLimitError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AIサービスの利用上限に達しました。しばらく時間をおいてから再試行してください。",
        )
    except AIServiceError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AIサービスでエラーが発生しました。時間をおいて再試行してください。",
        )
    except AIGenerationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    comment = save_ai_comment(
        db,
        record_type=body.record_type,
        record_id=body.record_id,
        baby_id=baby_id,
        feedback=feedback_text,
        has_concern=has_concern,
    )

    return RecordFeedbackResponse(
        feedback=feedback_text,
        has_concern=has_concern,
        comment_id=comment.id,
        record_type=body.record_type,
        analyzed_at=get_jst_now(),
        model_name=model_name,
    )
