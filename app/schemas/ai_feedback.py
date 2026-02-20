from pydantic import BaseModel
from datetime import datetime
from typing import Literal


RecordType = Literal["feeding", "diaper", "growth", "note"]


class RecordFeedbackRequest(BaseModel):
    record_type: RecordType
    record_id: int


class RecordFeedbackResponse(BaseModel):
    feedback: str
    has_concern: bool
    comment_id: int
    record_type: str
    analyzed_at: datetime
    model_name: str
