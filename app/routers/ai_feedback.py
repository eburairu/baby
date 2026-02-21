from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import openai

from app.dependencies import get_db, get_current_user, verify_baby_access
from app.models.user import User
from app.schemas.ai_feedback import RecordFeedbackRequest, RecordFeedbackResponse
from app.services.ai_feedback import (
    _verify_record_ownership,
    generate_record_feedback,
    save_ai_comment,
)

router = APIRouter(prefix="/api/babies/{baby_id}/record-feedback", tags=["ai-feedback"])


@router.post("", response_model=RecordFeedbackResponse, status_code=status.HTTP_201_CREATED)
def create_record_feedback(
    baby_id: int,
    body: RecordFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """直近24時間の記録をAIが分析し、コメントとして保存する"""
    baby = verify_baby_access(db, baby_id, current_user.id, require_write=False)

    # record_id が baby_id に属するか確認
    _verify_record_ownership(db, body.record_type, body.record_id, baby_id)

    try:
        feedback_text, has_concern, model_name = generate_record_feedback(
            db, baby_id, baby.name, body.record_type, body.record_id
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except openai.RateLimitError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AIサービスの利用上限に達しました。しばらく時間をおいてから再試行してください。",
        )
    except openai.OpenAIError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AIサービスでエラーが発生しました。時間をおいて再試行してください。",
        )

    comment = save_ai_comment(
        db,
        record_type=body.record_type,
        record_id=body.record_id,
        baby_id=baby_id,
        feedback=feedback_text,
        has_concern=has_concern,
    )

    JST = timezone(timedelta(hours=9))
    return RecordFeedbackResponse(
        feedback=feedback_text,
        has_concern=has_concern,
        comment_id=comment.id,
        record_type=body.record_type,
        analyzed_at=datetime.now(JST),
        model_name=model_name,
    )
